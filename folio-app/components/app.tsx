import { useMemo } from "react";
import { createBrowserRouter, Outlet, RouterProvider, redirect } from "react-router";
import { useClients } from "../contexts/clients.tsx";
import { Welcome } from "./welcome.tsx";
import { Editor } from "./editor.tsx";
import { Login } from "./login.tsx";
import { LocalStorageKeys } from "../constants.ts";
import type { JSX } from "react";
import type { StorageClient } from "../types/clients.ts";

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
        if (clients.authentication) {
            routes.push({
                path: "/login",
                Component: Login,
            });
            // protected routes
            routes.push({
                loader: async () => {
                    const isAuthenticated = await clients.authentication?.isAuthenticated();
                    if (!isAuthenticated) {
                        redirect("/login");
                    }
                    return null;
                },
                Component: () => <Outlet />,
            });
        }
        // create a browser router using routes generated from available clients
        return createBrowserRouter(routes);
    }, [clients]);

    return (
        <RouterProvider router={router} />
    );
};
