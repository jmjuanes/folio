import { Fragment, useMemo, useCallback, useRef, useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";
import { Centered } from "folio-react/components/ui/centered.tsx";
import { Overlay, OverlayVariant } from "folio-react/components/ui/overlay.tsx";
import { ClientsProvider } from "./contexts/clients.tsx";
import { SessionProvider, useSession } from "./contexts/session.tsx";
import { StorageProvider, useStorage } from "./contexts/storage.tsx";
import { ToasterProvider, useToaster } from "./contexts/toaster.tsx";
import { RouterProvider, Switch, Route, useLocation } from "./contexts/router.tsx";
import { Welcome } from "./components/welcome.tsx";
// import { Board } from "./components/Board.tsx";
import { Recents } from "./components/recents.tsx";
import { Sidebar } from "./components/sidebar.tsx";
import { Connection } from "./components/connection.tsx";
import type { JSX } from "react";

const App = (): JSX.Element => {
    const session = useSession();
    const storage = useStorage();
    const currentLocation = useLocation();

    // check if connection dialog should be displayed
    const shouldDisplayConnectionDialog = useMemo(() => {
        return !session?.state?.id;
    }, [session?.state?.id]);

    // check if welcome dialog should be displayed
    // const shouldDisplayWelcomeDialog = useMemo(() => {
    //     return currentLocation === "" && storage.enabled && !shouldDisplayLoginDialog;
    // }, [shouldDisplayLoginDialog, currentLocation, storage.enabled]);

    // check if we have to display the connection dialog
    if (shouldDisplayConnectionDialog) {
        return (
            <Fragment>
                <Overlay variant={OverlayVariant.TRANSPARENT} className="z-50 glass" />
                <Centered className="fixed h-full z-50">
                    <Connection />
                </Centered>
            </Fragment>
        );
    }

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-gray-100 text-gray-800 flex py-2 pr-2">
            <Sidebar />
            <div className="w-full h-full overflow-hidden rounded-3xl bg-white">
                <Switch>
                    <Route test="" render={() => (
                        <Centered className="w-full h-full">
                            <Welcome />
                        </Centered>
                    )} />
                    <Route test="recents" render={() => (
                        <Recents />
                    )} />
                {/*
                <Board key={currentLocation} />
                */}
                </Switch>
            </div>
        </div>
    );
};

createRoot(document.getElementById("root") as HTMLDivElement).render((
    <ToasterProvider>
        <ClientsProvider>
            <SessionProvider>
                <StorageProvider>
                    <RouterProvider>
                        <App />
                    </RouterProvider>
                </StorageProvider>
            </SessionProvider>
        </ClientsProvider>
    </ToasterProvider>
));
