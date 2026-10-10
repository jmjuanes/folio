import { createContext, useContext, useEffect, useRef, useCallback, useMemo, useState } from "react";
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

export enum Dialogs {
    LOGIN = "login",
    WELCOME = "welcome",
    SETTINGS = "settings",
};

// application state type
export type AppState = {
    ready: boolean;
    documents: StorageDocument[],
    preferences: any;
    activeDialog: Dialogs | null;
    activeBoard: string | null;
    // create or import documents
    createDocument: (data: any, metadata: any) => Promise<{ id: string }>;
    importDocument: () => Promise<{ id: string }>;
    // manipulating a document
    getDocument: (id: string) => Promise<StorageDocument>;
    updateDocument: (id: string, data: any, metadata: any) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    // additional document actions
    downloadDocument: (id: string) => Promise<void>;
    duplicateDocument: (id: string) => Promise<{ id: string }>;
    // preferences api
    getPreferences: () => Promise<any>;
    updatePreferences: (preferences: any) => Promise<void>;
    // manage active board
    openBoard: (id: string) => void;
    // manage dialogs
    openDialog: (dialog: Dialogs) => void;
    closeDialog: () => void;
    // handle login/logout
    
};

// internal app state context
const AppStateContext = createContext<AppState>({} as AppState);

// @description hook to use app state
export const useAppState = () => {
    return useContext(AppStateContext);
};

// @description app state provider
export const AppStateProvider = (props: PropsWithChildren): JSX.Element => {
    const [ready, setReady] = useState(false);
    const [userDocuments, setUserDocuments] = useState<StorageDocument[]>([]);
    const [userPreferences, setUserPreferences] = useState<any>(null);
    const [activeDialog, setActiveDialog] = useState<Dialogs | null>(null);
    const [activeBoard, setActiveBoard] = useState<string | null>(null);
    const clients = useClients();
    const auth = useAuthentication();

    // save if user is authenticated
    const isAuthenticated = auth.isAuthenticated();

    // get the storage client to use
    // note that currently only one of them is enabled
    const storageClient = useMemo<StorageClient | null>(() => {
        // 1. check if the user is authenticated
        if (clients.authentication && clients.remoteStorage && isAuthenticated) {
            return clients.remoteStorage;
        }
        // 2. check if local storage client is configured
        else if (clients.localStorage) {
            return clients.localStorage;
        }
        // other case, no storage is available
        return null;
    }, [clients, isAuthenticated]);

    // internal method to fetch the user preferences
    const getUserPreferences = useCallback(async () => {
        setUserPreferences(null);
        if (storageClient) {
            try {
                const preferences = await storageClient?.get(Collections.PREFERENCES)
                setUserPreferences(preferences?.value || {});
            }
            catch (error: any) {
                console.error(error);
                setUserPreferences({});
            }
        }
    }, [storageClient, setUserPreferences]);

    // internal method to fetch documents of the logged user
    const getUserDocuments = useCallback(async () => {
        setUserDocuments([]); // reset user documents before fetching the new ones
        if (storageClient) {
            const data: any = await storageClient?.list();
            const filteredUserDocuments = (data || []).filter((documentItem: any) => {
                return documentItem.id !== Collections.PREFERENCES;
            });
            // save filtered user documents
            setUserDocuments(filteredUserDocuments);
        }
    }, [storageClient, setUserDocuments]);

    // initialize app actions
    const app = useMemo<AppState>(() => {
        const createDocument = async (data: any = {}, metadata: any = {}) => {
            const newDocumentId = ""; // TODO
            await storageClient?.create({
                id: newDocumentId,
                value: data || {},
                metadata: Object.assign(metadata, {
                    created_at: Date.now(),
                    updated_at: Date.now(),
                    name: metadata?.title || data?.title || "Untitled",
                }),
            });
            await getUserDocuments();
            return Promise.resolve({ id: newDocumentId });
        };
        return {
            activeBoard: activeBoard || null,
            activeDialog: activeDialog || null,
            documents: userDocuments,
            preferences: userPreferences,
            createDocument: (data: any = {}, metadata: any = {}) => {
                return createDocument(data, metadata);
            },
            importDocument: () => {
                return loadFromJson().then((data: any) => {
                    return createDocument(data, {});
                });
            },
            getDocument: (id: string) => {
                return storageClient?.get(id);
            },
            deleteDocument: async (id: string) => {
                await storageClient?.delete(id);
                await getUserDocuments();
            },
            updateDocument: async (id: string, data: any, metadata: any) => {
                return storageClient?.update(id, {
                    value: data || {},
                    metadata: Object.assign(metadata, {
                        updated_at: Date.now(),
                    }),
                });
            },
            downloadDocument: async (id: string) => {
                const response = await storageClient?.get(id);
                if (response?.value) {
                    return saveAsJson(JSON.parse(response.value as any));
                }
            },
            duplicateDocument: async (id: string) => {
                const originalResponse = await storageClient?.get(id);
                if (originalResponse) {
                    const newDocumentId = "";
                    await storageClient?.create({
                        id: newDocumentId,
                        value: originalResponse?.value || {},
                        metadata: Object.assign(originalResponse.metadata || {}, {
                            name: `Copy of ${originalResponse?.metadata?.name || "Untitled"}`,
                            updated_at: Date.now(),
                        }),
                    });
                    await getUserDocuments();
                    return Promise.resolve({ id: newDocumentId });
                }
                // document not found??
                return Promise.reject(new Error("Document not found"));
            },
            getPreferences: () => {
                return Promise.resolve(userPreferences || {});
            },
            updatePreferences: async (preferences: any) => {
                const newPreferences = Object.assign({}, userPreferences, preferences);
                setUserPreferences(newPreferences); // update internal reference to user preferences
                return storageClient?.update(Collections.PREFERENCES, {
                    value: newPreferences,
                    metadata: {
                        updated_at: Date.now(),
                    },
                });
            },
            // getUser: async () => {
            //     const response = await client.graphql(GET_USER, {});
            //     return response?.getUser as User || null;
            // },
            // logout: () => {
            //     // on logout, we just destroy the session. This will automatically
            //     // display the login screen
            //     client.logout();
            // },
            openDialog: (dialog: Dialogs) => {
                setActiveDialog(dialog);
            },
            closeDialog: () => {
                setActiveDialog(null);
            },
            openBoard: (id: string) => {
                setActiveBoard(id);
            },
        } as AppState;
    }, [storageClient, userDocuments, userPreferences, activeBoard, activeDialog]);

    // when the app is mounted, fetch documents of the logged-in user
    useEffect(() => {
        const initialize = async () => {
            setReady(false);
            await getUserPreferences();
            await getUserDocuments();
            setReady(true);
        };
        initialize();
    }, [storageClient, getUserDocuments, getUserPreferences, setReady]);

    // if no storage client is available, force to display the login dialog
    useEffect(() => {
        // if no storage client is available, show the login window
        if (!storageClient) {
            setActiveBoard(null);
            setActiveDialog(Dialogs.LOGIN);
        }
        // if storage client is available, show the welcome dialog
        else {
            setActiveDialog(Dialogs.WELCOME);
        }
    }, [storageClient]);

    // at least user preferences must be provided before continuing to the app
    // if (!userPreferences) {
    if (!ready) {
        return (
            <Loading className="w-full h-full" />
        );
    }

    return (
        <AppStateContext.Provider value={app}>
            {props.children}
        </AppStateContext.Provider>
    );
};
