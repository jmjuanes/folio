import { createContext, useContext, useEffect, useRef, useReducer, useCallback, useState } from "react";
import { loadFromJson, saveAsJson } from "folio-react/lib/json.js";
import { Loading } from "folio-react/components/loading.jsx";
import { Collections } from "../constants.ts";
import { useClients } from "./Clients.tsx";
import * as sharedStyles from "../styles/shared.css";
import type { JSX, PropsWithChildren } from "react";
import type { Document } from "../types/clients.ts";

// application state type
export type AppState = {
    version: number;
    documents: Document[],
    preferences: any;

    refresh: () => void;

    // create or import documents
    createDocument: (data: any, metadata: any) => Promise<Document>;
    importDocument: () => Promise<Document>;

    // manipulating a document
    getDocument: (id: string) => Promise<Document | null>;
    updateDocument: (id: string, data: any, metadata: any) => Promise<Document>;
    deleteDocument: (id: string) => Promise<Document>;

    // additional document actions
    downloadDocument: (id: string) => Promise<void>;
    duplicateDocument: (id: string) => Promise<Document | null>;

    // preferences api
    getPreferences: () => Promise<any>;
    updatePreferences: (preferences: any) => Promise<void>;
};

// internal app state context
const AppStateContext = createContext<AppState>({} as AppState);

// @description hook to use app state
export const useAppState = () => {
    return useContext(AppStateContext);
};

// @description app state provider
export const AppStateProvider = (props: PropsWithChildren): JSX.Element => {
    const [appVersion, incrementAppVersion] = useReducer((x: number): number => x + 1, 0);
    const app = useRef<AppState>({} as AppState);
    const clients = useClients();

    // get the storage client to use
    // note that currently only one of them is enabled
    const storageClient = clients.localStorage || clients.remoteStorage;

    // update app version in app.current.version
    app.current.version = appVersion;

    // internal method to fetch the user preferences
    const fetchUserPreferences = useCallback(() => {
        // app.current.preferences = null;
        storageClient?.get(Collections.PREFERENCES)
            .then(data => {
                app.current.preferences = data?.value || {};
            })
            .catch(error => {
                console.error(error);
                app.current.preferences = {};
            })
            .finally(() => {
                incrementAppVersion();
            });
    }, [storageClient, incrementAppVersion]);

    // internal method to fetch documents of the logged user
    const fetchUserDocuments = useCallback(() => {
        app.current.documents = []; // clean documents reference
        storageClient?.list().then(data => {
            // Note: we have to exclude special documents
            app.current.documents = (data || []).filter(documentItem => {
                return documentItem.id !== Collections.PREFERENCES;
            });
            incrementAppVersion();
        });
    }, [storageClient, incrementAppVersion]);

    // initialize app actions
    if (!app.current.refresh) {
        Object.assign(app.current, {
            refresh: () => {
                fetchUserDocuments();
            },
            createDocument: (data: any = {}, metadata: any = {}) => {
                return storageClient?.create({
                    value: data || {},
                    metadata: Object.assign(metadata, {
                        created_at: Date.now(),
                        updated_at: Date.now(),
                        name: metadata?.title || data?.title || "Untitled",
                    }),
                });
            },
            importDocument: () => {
                return loadFromJson().then((data: any) => {
                    return app.current.createDocument(data, {});
                });
            },
            getDocument: (id: string) => {
                return storageClient?.get(id);
            },
            deleteDocument: async (id: string) => {
                return storageClient?.delete(id);
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
                const response = await app.current.getDocument(id);
                if (response?.value) {
                    return saveAsJson(JSON.parse(response.value as any));
                }
            },
            duplicateDocument: async (id: string) => {
                const originalResponse: Document | null = await app.current.getDocument(id);
                if (originalResponse) {
                    const newDocumentName = `Copy of ${originalResponse?.metadata?.name || "Untitled"}`;
                    return storageClient?.create({
                        value: originalResponse?.value || {},
                        metadata: Object.assign(originalResponse.metadata || {}, {
                            name: newDocumentName,
                            updated_at: Date.now(),
                        }),
                    });
                }
                // document not found??
                return Promise.reject(new Error("Document not found"));
            },
            getPreferences: () => {
                return Promise.resolve(app.current.preferences || {});
            },
            updatePreferences: (preferences: any) => {
                app.current.preferences = Object.assign({}, app.current.preferences, preferences);
                return storageClient?.update(Collections.PREFERENCES, {
                    value: app.current.preferences,
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
        });
    }

    // when the app is mounted, fetch documents of the logged-in user
    useEffect(() => {
        fetchUserPreferences();
        fetchUserDocuments();
    }, []);

    // at least user preferences must be provided before continuing to the app
    if (!app.current.preferences) {
        return (
            <Loading className={sharedStyles.loading} />
        );
    }

    return (
        <AppStateContext.Provider value={app.current}>
            {props.children}
        </AppStateContext.Provider>
    );
};
