import { createContext, useContext, useEffect, useCallback, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useSession } from "./session.tsx";
import type { JSX, PropsWithChildren } from "react";
import type { Entry } from "../lib/types/client.ts";

enum Collections {
    BOARD = "board",
    PREFERENCES = "preferences",
};

export type Storage = {
    documents: Entry[];
    preferences: any;
    // create or import documents
    createDocument: (value?: any) => Promise<string>;
    getDocument: (id: string) => Promise<any>;
    updateDocument: (id: string, value: any) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    // preferences
    updatePreferences: (value: any) => Promise<void>;
};

const StorageContext = createContext<Storage>({} as Storage);

// @description hook to use the storage
export const useStorage = (): Storage => {
    return useContext(StorageContext);
};

// @description storage provider
export const StorageProvider = (props: PropsWithChildren): JSX.Element => {
    const session = useSession();
    const [userDocuments, setUserDocuments] = useState<Entry[]>([]);
    const [userPreferences, setUserPreferences] = useState({});

    // client for which documents and preferences have been loaded
    // (undefined = nothing loaded yet). The provider is ready when it matches the active client
    const client = session.client;

    // fetch user documents
    const fetchUserDocuments = useCallback(async () => {
        if (client) {
            const documentsList: Entry[] = await client?.list();
            return (documentsList || []).filter((item: any) => {
                return item.id !== Collections.PREFERENCES;
            });
        }
        // if no storage client is configured, return an empty array
        return Promise.resolve([]);
    }, [client]);

    // reset user documents when the client changes
    useEffect(() => {
        let cancelled = false;
        if (client) {
            setUserDocuments([]);
            fetchUserDocuments().then(newUserDocuments => {
                if (!cancelled) {
                    setUserDocuments(newUserDocuments);
                }
            });
        }
        // cancel the request when the client changes
        return () => { cancelled = true; };
    }, [client, fetchUserDocuments, setUserDocuments]);

    // fetch user preferences when the client changes
    useEffect(() => {
        let cancelled = false;
        if (client) {
            setUserPreferences({}); // reset previous preferences
            client.get(Collections.PREFERENCES).then((response) => {
                if (!cancelled) {
                    setUserPreferences(response.value || {});
                }
            });
        }
        // when che client changes, we have to invalidate the previous call
        // if no completed or in progress
        return () => { cancelled = true; };
    }, [client, setUserPreferences]);

    const storage = useMemo<Storage>(() => {
        const refreshDocuments = async () => {
            return fetchUserDocuments().then(newUserDocuments => {
                setUserDocuments(newUserDocuments);
            });
        };
        const createDocument = async (value: any = {}) => {
            const documentId = uuid();
            const now = Date.now();
            await client?.create(documentId, {
                value: value || {},
                metadata: {
                    created_at: now,
                    updated_at: now,
                    name: value?.title || "Untitled",
                },
            });
            await refreshDocuments();
            return Promise.resolve(documentId);
        };
        return {
            documents: userDocuments,
            preferences: userPreferences,
            createDocument: createDocument,
            getDocument: (id: string) => {
                return client?.get(id).then(response => {
                    return response.value || {};
                });
            },
            updateDocument: async (id: string, value: any) => {
                const documentMetadata = userDocuments.find(entry => entry.id === id);
                await client?.update(id, {
                    value: value || {},
                    metadata: {
                        ...documentMetadata?.metadata,
                        updated_at: Date.now(),
                        name: value?.title || "Untitled",
                    },
                });
            },
            deleteDocument: async (id: string) => {
                await client?.delete(id);
                await refreshDocuments();
            },
            updatePreferences: async (preferences: any) => {
                const newPreferences = Object.assign({}, userPreferences, preferences);
                setUserPreferences(newPreferences);
                await client?.update(Collections.PREFERENCES, newPreferences);
            },
        } as Storage;
    }, [client, userDocuments, userPreferences, fetchUserDocuments]);

    return (
        <StorageContext value={storage}>
            {props.children}
        </StorageContext>
    );
};
