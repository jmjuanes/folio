import React from "react";
import {createRoot} from "react-dom/client";
import {ClientProvider} from "./contexts/ClientContext.jsx";
import {ConfirmProvider} from "./contexts/ConfirmContext.jsx";
import {RouterProvider, Route, Switch, useRouter} from "./contexts/router.jsx";

import DashboardPage from "./app/dashboard.jsx";
import BoardPage from "./app/board.jsx";

import "lowcss/dist/low.css";

export const App = () => {
    const {currentPath} = useRouter();
    return (
        <Switch>
            <Route test={/^#?board\/(\w+)$/} render={() => (
                <div className="fixed top-0 left-0 h-full w-full bg-white text-neutral-700">
                    <BoardPage
                        key={currentPath}
                        id={currentPath.replace("#board/", "").trim()}
                    />
                </div>
            )} />
            <Route test="*" render={() => (
                <div className="w-full max-w-6xl mx-auto py-20">
                    <div className="mb-8">
                        <div className="font-black text-7xl">folio.</div>
                    </div>
                    <Route test={/^(#|#home)$/} render={() => (
                        <DashboardPage />
                    )} />
                </div>
            )} />
        </Switch>
    );
};

// Mount app component
createRoot(document.getElementById("root")).render((
    <RouterProvider>
        <ClientProvider>
            <ConfirmProvider>
                <App version={process.env.VERSION} />
            </ConfirmProvider>
        </ClientProvider>
    </RouterProvider>
));
