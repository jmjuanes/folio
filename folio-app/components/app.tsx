import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { useClients } from "../contexts/clients.tsx";
import { Welcome } from "./welcome.tsx";
import type { JSX } from "react";

export const App = (): JSX.Element => {
    const clients = useClients();
    const router = useMemo(() => {
        const routes = [];
        if (clients.localStorage) {
            routes.push({
                path: "/",
                Component: Welcome,
            });
            // routes.push({
            //     path: "/board",
            // });
        }
        // create a browser router using routes generated from available clients
        return createBrowserRouter(routes);
    }, [clients]);

    return (
        <RouterProvider router={router} />
    );
};
