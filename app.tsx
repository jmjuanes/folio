import { Fragment, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Loading } from "folio-react/components/loading.jsx";
import { Centered } from "folio-react/components/ui/centered.tsx";
import { Overlay, OverlayVariant } from "folio-react/components/ui/overlay.tsx";
import { SessionProvider, useSession } from "./contexts/session.tsx";
import { StorageProvider, useStorage } from "./contexts/storage.tsx";
import { ToasterProvider } from "./contexts/toaster.tsx";
import { RouterProvider, Route, useLocation } from "./contexts/router.tsx";
import { Welcome } from "./components/welcome.tsx";
// import { Board } from "./components/Board.tsx";
import { Connection } from "./components/connection.tsx";
import type { JSX } from "react";

// main app component
const App = (): JSX.Element => {
    const session = useSession();
    const storage = useStorage();
    const currentLocation = useLocation();
    const landed = useRef<boolean>(false);

    // when the app starts, open the last edited board (or create a new one if there are no boards)
    // The welcome page is not a step of the startup, it is just a page that can be visited later
    useEffect(() => {
        if (session.status === "connected" && storage.ready && !landed.current) {
            landed.current = true;
            if (currentLocation === "") {
                // app(AppActions.OPEN_LAST_EDITED_DOCUMENT).catch(console.error);
            }
        }
    }, [session.status, storage.ready]);

    // wait until the documents of the storage are loaded
    if (!storage.ready) {
        return (
            <Loading className="w-full h-full" />
        );
    }

    return (
        <div className="fixed top-0 left-0 h-full w-full text-gray-800">
            {session.status === "connected" && (
                <Fragment>
                    <Route test="" render={() => (
                        <Centered className="w-full h-full">
                            <Welcome />
                        </Centered>
                    )} />
                </Fragment>
            )}
            {session.status !== "connected" && (
                <Fragment>
                    <Overlay variant={OverlayVariant.TRANSPARENT} className="z-50 glass" />
                    <Centered className="fixed h-full z-50">
                        <Connection />
                    </Centered>
                </Fragment>
            )}
        </div>
    );
};

createRoot(document.getElementById("root") as HTMLDivElement).render((
    <ToasterProvider>
        <SessionProvider>
            <StorageProvider>
                <RouterProvider>
                    <App />
                </RouterProvider>
            </StorageProvider>
        </SessionProvider>
    </ToasterProvider>
));
