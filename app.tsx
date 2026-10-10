import { Fragment, useMemo, useCallback, useRef, useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, createHashRouter } from "react-router";
import { RouterProvider, useParams, Outlet, useOutletContext, Navigate, useNavigate } from "react-router";
import { loadFromJson, saveAsJson } from "folio-react/lib/json.js";
import { Loading } from "folio-react/components/loading.jsx";
import { Centered } from "folio-react/components/ui/centered.tsx";
import { Overlay, OverlayVariant } from "folio-react/components/ui/overlay.tsx";
import { ClientsProvider, useClients } from "./contexts/Clients.tsx";
import { AuthenticationProvider, useAuthentication } from "./contexts/Authentication.tsx";
import { ToasterProvider, useToaster } from "./contexts/Toaster.tsx";
import { Welcome } from "./components/Welcome.tsx";
import { Board } from "./components/Board.tsx";
import { Login } from "./components/Login.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import type { JSX, PropsWithChildren } from "react";
import type { Document, Credentials } from "./lib/clients/types.ts";
import type { SidebarDocument } from "./components/Sidebar.tsx";

enum Collections {
    BOARD = "board",
    PREFERENCES = "preferences",
};

// application state type
type AppState = {
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

const ProtectedAppContent = (): JSX.Element => {
    const [appVersion, incrementAppVersion] = useReducer((x: number): number => x + 1, 0);
    const app = useRef<AppState>({} as AppState);
    const clients = useClients();
    const auth = useAuthentication();

    // save if user is authenticated
    const isAuthenticated = auth.isAuthenticated();

    // get the storage client to use
    // note that currently only one of them is enabled
    const storageClient = useMemo(() => {
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

    // update app version in app.current.version
    app.current.version = appVersion;

    // internal method to fetch the user preferences
    const fetchUserPreferences = useCallback(() => {
        app.current.preferences = null; // reset preferences
        if (storageClient) {
            storageClient?.get(Collections.PREFERENCES)
                .then((data: any) => {
                    app.current.preferences = data?.value || {};
                })
                .catch((error: any) => {
                    console.error(error);
                    app.current.preferences = {};
                })
                .finally(() => {
                    incrementAppVersion();
                });
        }
    }, [storageClient, incrementAppVersion]);

    // internal method to fetch documents of the logged user
    const fetchUserDocuments = useCallback(() => {
        app.current.documents = []; // clean documents reference
        if (storageClient) {
            storageClient?.list().then((data: any) => {
                // Note: we have to exclude special documents
                app.current.documents = (data || []).filter((documentItem: any) => {
                    return documentItem.id !== Collections.PREFERENCES;
                });
                incrementAppVersion();
            });
        }
    }, [storageClient, incrementAppVersion]);

    // initialize app actions
    const appInstance = useMemo<AppState>(() => {
        return Object.assign(app.current, {
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
    }, [fetchUserDocuments]);

    // when the app is mounted, fetch documents of the logged-in user
    useEffect(() => {
        if (storageClient) {
            fetchUserDocuments();
            fetchUserPreferences();
        }
    }, [storageClient, fetchUserDocuments, fetchUserPreferences]);

    // if no storage client is available, redirect to login window
    if (!storageClient) {
        return <Navigate to="/login" replace={true} />;
    }

    // at least user preferences must be provided before continuing to the app
    if (!app.current.preferences) {
        return (
            <Loading className="w-full h-full" />
        );
    }

    // other case, return the content of the application
    return <Outlet context={appInstance} />;
};

// mocked app content
const MockedAppContent = (props: PropsWithChildren): JSX.Element => (
    <Fragment>
        <Board
            key="mocked"
            readonly={true}
        />
        <Overlay variant={OverlayVariant.TRANSPARENT} className="z-50 glass" />
        <Centered className="fixed h-full z-50">
            {props.children}
        </Centered>
    </Fragment>
);

// internal login route
const LoginRoute = (): JSX.Element => {
    const auth = useAuthentication();
    const clients = useClients();
    const navigate = useNavigate();

    // handle login when the user inserts its credentials
    const handleLogin = useCallback((credentials: Credentials) => {
        if (clients.authentication) {
            return clients.authentication.login(credentials).then(() => {
                auth.refresh();
                navigate("/");
            });
        }
        // no client to handle the authentication, reject the login
        return Promise.reject(new Error("No aunthentication client configured"));
    }, [auth, clients.authentication]);

    return (
        <MockedAppContent>
            <Login onLogin={handleLogin} />
        </MockedAppContent>
    );
};

// main welcome route
// it displays a welcome message and a list of recent boards
const HomeRoute = (): JSX.Element => {
    const app = useOutletContext<AppState>();
    const navigate = useNavigate();
    
    // handle closing the welcome dialog
    // it should get the first document saved in the storage. If not, it will create a new document
    // and open it
    const handleWelcomeDialogClose = useCallback(async () => {
        // 1. check if we have at least one document loaded
        if (app.documents.length > 0) {
            return navigate("/" + app.documents[0].id);
        }
        // 2. if documents is empty, create a new document
        const { id } = await app.createDocument({}, {});
        return navigate("/" + id);
    }, [app, navigate]);

    return (
        <MockedAppContent>
            <Welcome
                onClose={handleWelcomeDialogClose}
            />
        </MockedAppContent>
    );
};

// internal board route
// it gets the id from the path and fetches the document from the storage
const BoardRoute = (): JSX.Element => {
    const app = useOutletContext<AppState>();
    const toaster = useToaster();
    const { id } = useParams<{ id: string }>();
    // we have to save a reference to the original document to restore
    // metadata when board data changes
    const initialDocument = useRef<Document>(null);

    return (
        <Fragment>
            <Sidebar
                defaultCollapsed={true}
                documents={(app.documents || []).map(documentItem => {
                    return {
                        id: documentItem.id,
                        name: documentItem.metadata?.name || "Untitled",
                        created_at: documentItem.metadata?.created_at,
                        updated_at: documentItem.metadata?.updated_at,
                    } as SidebarDocument;
                })}
                onDocumentDownload={(id: string) => {
                    app.downloadDocument(id)
                        .then(() => {
                            toaster.success("Document saved.");
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }}
                onDocumentDuplicate={(id: string) => {
                    app.duplicateDocument(id)
                        .then((newDocument) => {
                            app.refresh();
                            toaster.success(`Duplicate saved as '${newDocument?.name || "Untitled"}'.`);
                        })
                        .catch(error => {
                            console.error(error);
                            toaster.error(error?.message || "An error occurred while duplicating the document.");
                        });
                }}
                onDocumentDelete={(id: string) => {
                    console.error("not implemented");
                }}
            />
            <div className="w-full h-full overflow-hidden rounded-3xl bg-white">
                <Board
                    key={`board:${id}`}
                    preferences={app.preferences || {}}
                    onDataLoad={async () => {
                        const document = await app.getDocument(id || "");
                        if (!document) {
                            throw new Error(`Board with id "${id}" not found.`);
                        }
                        // save the reference to the document to update then
                        initialDocument.current = document;
                        return document?.value || {};
                    }}
                    onDataChange={(data: any) => {
                        const metadata = initialDocument.current?.metadata || {};
                        return app.updateDocument(id || "", data, {
                            ...metadata,
                            name: data?.title || metadata.name || "Untitled",
                        });
                    }}
                    onPreferencesChange={(preferences: any) => {
                        return app.updatePreferences(preferences);
                    }}
                />
            </div>
        </Fragment>
    );
};

// build application router
const router = createHashRouter([
    {
        path: "/login",
        Component: LoginRoute,
    },
    {
        Component: ProtectedAppContent,
        children: [
            {
                path: "/",
                Component: HomeRoute,
            },
            {
                path: "/:id",
                Component: BoardRoute,
            },
        ],
    },
]);

createRoot(document.getElementById("root") as HTMLDivElement).render((
    <div className="fixed top-0 left-0 h-full w-full bg-gray-100 text-gray-800 flex py-2 pr-2">
        <ToasterProvider>
            <ClientsProvider>
                <AuthenticationProvider>
                    <RouterProvider router={router} />
                </AuthenticationProvider>
            </ClientsProvider>
        </ToasterProvider>
    </div>
));
