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
    // true when documents and preferences of the active client have been loaded
    ready: boolean;
    documents: Entry[];
    preferences: any;
    // create or import documents
    createDocument: (value?: any, metadata?: any) => Promise<string>;
    getDocument: (id: string) => Promise<any>;
    updateDocument: (id: string, value: any, metadata?: any) => Promise<void>;
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
    const [ready, setReady] = useState<boolean>(false);

    // active client, it is only available when the session is connected
    const client = session.client;

    // fetch user documents, sorted by the last edited first
    const fetchUserDocuments = useCallback(async () => {
        if (client) {
            const documentsList: Entry[] = await client?.list();
            return (documentsList || []).filter((item: any) => {
                return item.id !== Collections.PREFERENCES;
            });
            // .sort((a: any, b: any) => (b.metadata?.updated_at || 0) - (a.metadata?.updated_at || 0));
        }
        // if no storage client is configured, return an empty array
        return Promise.resolve([]);
    }, [client]);

    // fetch user preferences
    const fetchUserPreferences = useCallback(async () => {
        if (client) {
            return client.get(Collections.PREFERENCES).then(r => r?.value || {}).catch(() => ({}));
        }
        // if no storage client is configured, return an empty preferences object
        return Promise.resolve({});
    }, [client]);

    // initialize user data
    const fetchInitialUserData = useCallback(() => {
        return Promise.all([fetchUserDocuments(), fetchUserPreferences()]);
    }, [fetchUserDocuments, fetchUserPreferences]);

    // load documents and preferences every time the client changes
    useEffect(() => {
        let cancelled = false;
        setReady(false);
        setUserDocuments([]);
        setUserPreferences({});
        fetchInitialUserData().then(([newUserDocuments, newUserPreferences]) => {
            if (!cancelled) {
                setUserDocuments(newUserDocuments);
                setUserPreferences(newUserPreferences);
                setReady(true);
            }
        });
        // when the client changes, invalidate the calls that are still in progress
        return () => {
            cancelled = true;
        };
    }, [client, fetchInitialUserData]);

    const storage = useMemo<Storage>(() => {
        const refreshDocuments = async () => {
            return fetchUserDocuments().then(newUserDocuments => {
                setUserDocuments(newUserDocuments);
            });
        };
        const createDocument = async (value: any, metadata?: any) => {
            const documentId = uuid();
            await client?.create(documentId, {
                value: value || {},
                metadata: {
                    ...(metadata || {}),
                    created_at: Date.now(),
                    updated_at: Date.now(),
                },
            });
            await refreshDocuments();
            return Promise.resolve(documentId);
        };
        return {
            ready: ready,
            documents: userDocuments,
            preferences: userPreferences,
            createDocument: createDocument,
            getDocument: (id: string) => {
                return client?.get(id).then(response => {
                    return response.value || {};
                });
            },
            updateDocument: async (id: string, value: any, metadata: any) => {
                const documentMetadata = userDocuments.find(entry => entry.id === id);
                await client?.update(id, {
                    value: value || {},
                    metadata: {
                        ...documentMetadata?.metadata,
                        ...(metadata || {}),
                        updated_at: Date.now(),
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
                await client?.update(Collections.PREFERENCES, {
                    value: newPreferences,
                    metadata: {
                        updated_at: Date.now(),
                    },
                });
            },
        } as Storage;
    }, [client, ready, userDocuments, userPreferences, fetchUserDocuments]);

    return (
        <StorageContext value={storage}>
            {props.children}
        </StorageContext>
    );
};
