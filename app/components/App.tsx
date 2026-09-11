import { useMemo } from "react";
import { createHashRouter, RouterProvider, useParams } from "react-router";
import { useClients } from "../contexts/clients.tsx";
import { Welcome } from "./welcome.tsx";
import { Layout } from "./Layout.tsx";
import { Home } from "./Home.tsx";
import { Editor } from "./Editor.tsx";
import { Login } from "./Login.tsx";
import { AuthenticationProvider } from "../contexts/authentication.tsx";
import { AppStateProvider } from "../contexts/AppState.tsx";
import { LocalStorageKeys, RemoteStorageKeys } from "../constants.ts";
import type { JSX } from "react";
import type { StorageClient } from "../types/clients.ts";

// Board editor wrapper for remote storage: reads the board id from the URL
const RemoteBoardEditor = ({ storage }: { storage: StorageClient }): JSX.Element => {
    const { id } = useParams<{ id: string }>();
    return (
        <Editor
            key={`remote:${id}`}
            dataId={`board:${id}`}
            preferencesId={RemoteStorageKeys.PREFERENCES}
            storage={storage}
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
                                <Layout />
                            </AppStateProvider>
                        ),
                        children: [
                            {
                                path: "/",
                                Component: Home,
                            },
                            {
                                path: "/:id",
                                Component: () => (
                                    <RemoteBoardEditor
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
