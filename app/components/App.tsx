import { useMemo } from "react";
import { createHashRouter, RouterProvider, useParams, Outlet } from "react-router";
import { useClients } from "../contexts/clients.tsx";
import { Welcome } from "./Welcome.tsx";
import { Home } from "./Home.tsx";
import { Editor } from "./Editor.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { Login } from "./Login.tsx";
import { AuthenticationProvider } from "../contexts/authentication.tsx";
import { AppStateProvider } from "../contexts/AppState.tsx";
import { LocalStorageKeys, RemoteStorageKeys } from "../constants.ts";
import * as styles from "../styles/components.css";
import type { JSX } from "react";
import type { StorageClient } from "../types/clients.ts";

// Board editor wrapper for remote storage: reads the board id from the URL
const RemoteEditor = (props: { storage: StorageClient; resource: string; }): JSX.Element => {
    const { id } = useParams<{ id: string }>();
    return (
        <Editor
            key={`remote:${props.resource}:${id}`}
            dataId={`${props.resource}:${id}`}
            preferencesId={RemoteStorageKeys.PREFERENCES}
            storage={props.storage}
        />
    );
};

export const App = (): JSX.Element => {
    const clients = useClients();
    const router = useMemo(() => {
        const routes = [];
        if (clients.localStorage) {
            routes.push({
                path: "/",
                Component: Welcome,
            });
            routes.push({
                path: "/board",
                Component: () => (
                    <Editor
                        key="local:board"
                        dataId={LocalStorageKeys.BOARD}
                        preferencesId={LocalStorageKeys.PREFERENCES}
                        storage={clients.localStorage as StorageClient}
                    />
                ),
            });
        }
        // check if we have enabled the remote storage and the authentication
        if (clients.authentication && clients.remoteStorage) {
            routes.push({
                path: "/login",
                Component: Login,
            });
            // protected routes (require authentication)
            routes.push({
                Component: AuthenticationProvider,
                children: [
                    {
                        Component: () => (
                            <AppStateProvider client={clients.remoteStorage as StorageClient}>
                                <div className={styles.layout}>
                                    <Sidebar />
                                    <div className={styles.layoutContent}>
                                        <Outlet />
                                    </div>
                                </div>
                            </AppStateProvider>
                        ),
                        children: [
                            {
                                path: "/",
                                Component: Home,
                            },
                            {
                                path: "/boards/:id",
                                Component: () => (
                                    <RemoteEditor
                                        resource="board"
                                        storage={clients.remoteStorage as StorageClient}
                                    />
                                ),
                            },
                        ]
                    },
                ],
            });
        }
        // create a browser router using routes generated from available clients
        return createHashRouter(routes);
    }, [clients]);

    return (
        <RouterProvider router={router} />
    );
};
