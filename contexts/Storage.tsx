import { createContext, useContext, useEffect, useCallback, useMemo, useState } from "react";
import { loadFromJson, saveAsJson } from "folio-react/lib/json.js";
import { Loading } from "folio-react/components/loading.jsx";
import { useClients } from "./Clients.tsx";
import { useAuthentication } from "./Authentication.tsx";
import type { JSX, PropsWithChildren } from "react";
import type { StorageDocument, StorageClient } from "../lib/clients/types.ts";

export enum Collections {
    BOARD = "board",
    PREFERENCES = "preferences",
};

export type StorageType = "local" | "remote";

// storage state type
export type StorageState = {
    type: StorageType | null;
    documents: StorageDocument[];
    preferences: any;
    // create or import documents
    createDocument: (data?: any, metadata?: any) => Promise<{ id: string }>;
    importDocument: () => Promise<{ id: string }>;
    // manipulating a document
    getDocument: (id: string) => Promise<StorageDocument>;
    updateDocument: (id: string, data: any, metadata: any) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    // additional document actions
    downloadDocument: (id: string) => Promise<void>;
    duplicateDocument: (id: string) => Promise<{ id: string }>;
    // preferences
    updatePreferences: (preferences: any) => Promise<void>;
};

const StorageContext = createContext<StorageState>({} as StorageState);

// @description hook to use the storage
export const useStorage = (): StorageState => {
    return useContext(StorageContext);
};

// @description storage provider
export const StorageProvider = (props: PropsWithChildren): JSX.Element => {
    const clients = useClients();
    const auth = useAuthentication();
    const isAuthenticated = auth.isAuthenticated();
    const [documents, setDocuments] = useState<StorageDocument[]>([]);
    const [preferences, setPreferences] = useState<any>({});
    // client for which documents and preferences have been loaded
    // (undefined = nothing loaded yet). The provider is ready when it matches the active client
    const [loadedClient, setLoadedClient] = useState<StorageClient | null | undefined>(undefined);

    // storage to use: remote if authenticated, local otherwise, none if neither is configured
    const { type, client } = useMemo<{ type: StorageType | null; client: StorageClient | null }>(() => {
        if (clients.authentication && clients.remoteStorage && isAuthenticated) {
            return { type: "remote", client: clients.remoteStorage };
        }
        if (clients.localStorage) {
            return { type: "local", client: clients.localStorage };
        }
        return { type: null, client: null };
    }, [clients, isAuthenticated]);

    const ready = loadedClient === client;

    const fetchDocuments = useCallback(async (): Promise<StorageDocument[]> => {
        const list: any = await client?.list();
        return (list || []).filter((item: any) => item.id !== Collections.PREFERENCES);
    }, [client]);

    // load preferences and documents every time the active client changes
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [prefs, docs] = await Promise.all([
                    client?.get(Collections.PREFERENCES).catch(() => null),
                    fetchDocuments(),
                ]);
                if (!cancelled) {
                    setPreferences(prefs?.value || {});
                    setDocuments(docs);
                }
            }
            catch (error) {
                console.error(error);
                if (!cancelled) {
                    setPreferences({});
                    setDocuments([]);
                }
            }
            finally {
                if (!cancelled) {
                    setLoadedClient(client);
                }
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [client, fetchDocuments]);

    const storage = useMemo<StorageState>(() => {
        const refreshDocuments = async () => {
            setDocuments(await fetchDocuments());
        };
        const createDocument = async (data: any = {}, metadata: any = {}) => {
            const id = crypto.randomUUID();
            const now = Date.now();
            await client?.create({
                id: id,
                value: data || {},
                metadata: {
                    ...metadata,
                    created_at: now,
                    updated_at: now,
                    name: metadata?.name || metadata?.title || data?.title || "Untitled",
                },
            });
            await refreshDocuments();
            return { id: id };
        };
        return {
            type: type,
            documents: documents,
            preferences: preferences,
            createDocument: createDocument,
            importDocument: async () => {
                return createDocument(await loadFromJson());
            },
            getDocument: async (id: string) => {
                return client?.get(id) as Promise<StorageDocument>;
            },
            updateDocument: async (id: string, data: any, metadata: any) => {
                await client?.update(id, {
                    value: data || {},
                    metadata: { ...metadata, updated_at: Date.now() },
                });
            },
            deleteDocument: async (id: string) => {
                await client?.delete(id);
                await refreshDocuments();
            },
            downloadDocument: async (id: string) => {
                const response = await client?.get(id);
                if (response?.value) {
                    return saveAsJson(JSON.parse(response.value as any));
                }
            },
            duplicateDocument: async (id: string) => {
                const original = await client?.get(id);
                if (!original) {
                    throw new Error("Document not found");
                }
                return createDocument(original.value, {
                    ...original.metadata,
                    name: `Copy of ${original.metadata?.name || "Untitled"}`,
                });
            },
            updatePreferences: async (changes: any) => {
                const newPreferences = { ...preferences, ...changes };
                setPreferences(newPreferences);
                await client?.update(Collections.PREFERENCES, {
                    value: newPreferences,
                    metadata: { updated_at: Date.now() },
                });
            },
        };
    }, [type, client, documents, preferences, fetchDocuments]);

    // children are unmounted while the storage is (re)loading, so everything below
    // (navigation included) always starts from a clean state for each storage
    if (!ready) {
        return (
            <Loading className="w-full h-full" />
        );
    }

    return (
        <StorageContext value={storage}>
            {props.children}
        </StorageContext>
    );
};
