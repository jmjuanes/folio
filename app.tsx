import { Fragment, useEffect, useMemo, useRef } from "react";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
// import { PREFERENCES } from "./constants.ts";
import { Loading } from "./components/loading.jsx";
import { Centered } from "./components/ui/centered.tsx";
import { Editor } from "./components/editor.tsx";
import { Preferences, PreferencesContent } from "./components/preferences.tsx";
import { Title } from "./components/title.tsx";
// import { Library } from "./components/library.tsx";
import { SessionProvider, useSession } from "./contexts/session.tsx";
import { StorageProvider, useStorage } from "./contexts/storage.tsx";
import { ToasterProvider } from "./contexts/toaster.tsx";
import { RouterProvider, Switch, Route, useLocation } from "./contexts/router.tsx";
import { Welcome } from "./components/welcome.tsx";
import { NotFound } from "./components/not-found.tsx";
import { Connection } from "./components/connection.tsx";
import { useApp } from "./hooks/use-app.ts";
import { getConfig } from "./lib/config.ts";
import type { JSX } from "react";

// internal method to change the document title
// const setDocumentTitle = (title: string) => {
//     document.title = `${title} - folio lite`;
// };

// board component
const Board = (): JSX.Element => {
    const id = useLocation(); // get board ID from current location
    const storage = useStorage();
    const [error, setError] = useState(null);
    // const currentTitle = useRef<string>("Untitled");
    // const initialDocument = useRef<any>(null);

    // generate components overrides
    const componentsOverrides = useMemo(() => {
        return {
            Title: Title,
            // Library: Library,
            Preferences: () => (
                <Preferences>
                    <PreferencesContent
                        onChange={(newPreferences: any) => {
                            if (storage.ready && id) {
                                storage.updatePreferences(newPreferences || {});
                            }
                        }}
                    />
                </Preferences>
            ),
        };
    }, [storage, storage.ready, id]);

    // merge user preferences with pre-defined preferences of the application
    // const mergedPreferences = useMemo(() => {
    //     return {
    //         ...preferences,
    //     };
    // }, [preferences]);

    // this is a wrapper around store.getInitialData to get and update the document title
    const handleDataLoad = useCallback(async () => {
        // initialDocument.current = null; // reset initial document reference
        setError(null); // reset error message
        if (storage.ready && id) {
            try {
                const data = await storage.getDocument(id);
                // save a reference to the data object, so we can restore the
                // original metdata
                // initialDocument.current = data;
                return Promise.resolve(data?.value || {});
            }
            catch (error: any) {
                // it something went wrong, display a
                setError(error);
            }
        }
        // if no storage is configured or editor is in readonly mode,
        // return an empty object data
        return Promise.resolve({});
    }, [storage, storage.ready, id, setError]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = useCallback((data: any) => {
        if (storage.ready && id) {
            // const metadata = initialDocument.current?.metadata || {};
            storage.updateDocument(id, data, {
                // ...metadata,
                // name: data?.title || metadata.name || metadata.title || "Untitled",
            });
            // update the document title if it has changed
            // if (data?.title && data.title !== currentTitle.current) {
            //     setDocumentTitle(data.title);
            //     currentTitle.current = data.title;
            // }
        }
    }, [storage, storage.ready, id]);

    // when preferences change, call useEffect to update the preferences storage
    // useEffect(() => {
    //     if (storage.enabled && !!id) {
    //         if (preferences && preferences !== initialPreferences.current) {
    //             storage.updatePreferences(preferences);
    //             initialPreferences.current = preferences;
    //         }
    //     }
    // }, [storage, storage.enabled, id, preferences]);

    if (error) {
        return <NotFound />
    }

    return (
        <Editor
            key={`board:${id}`}
            readonly={!id}
            data={handleDataLoad}
            onChange={handleDataChange}
            components={componentsOverrides}
            preferences={storage.preferences || {}}
        />
    );
};

// main app component
const App = (): JSX.Element => {
    const app = useApp();
    const session = useSession();
    const storage = useStorage();
    const currentLocation = useLocation();
    const landed = useRef<boolean>(false);

    // when the app starts, check if we have to open the last edited document
    useEffect(() => {
        if (session.status === "connected" && storage.ready && !landed.current) {
            landed.current = true;
            if (currentLocation === "" && storage.documents.length > 0) {
                if (getConfig("routing.restoreLastEditedDocument")) {
                    app.openLastEditedDocument();
                }
            }
        }
    }, [session.status, storage.ready]);

    // check if should display the welcome on loading
    const shouldDisplayWelcome = useMemo(() => {
        return getConfig("ui.welcome.enabled") && storage.documents.length === 0;
    }, [storage]);

    // wait until the documents of the storage are loaded
    if (!storage.ready) {
        return (
            <Loading className="w-full h-full" />
        );
    }

    return (
        <div className="fixed top-0 left-0 h-full w-full text-gray-800">
            {session.status === "connected" && (
                <Switch>
                    <Route test="" render={() => (
                        <Fragment>
                            {shouldDisplayWelcome && (
                                <Welcome />
                            )}
                        </Fragment>
                    )} />
                    <Route test="*" render={() => (
                        <Board key={currentLocation} />
                    )} />
                </Switch>
            )}
            {session.status !== "connected" && (
                <Connection />
            )}
        </div>
    );
};

createRoot(document.getElementById("root") as HTMLDivElement).render((
    <ToasterProvider>
        <SessionProvider>
            <StorageProvider>
                <RouterProvider router={getConfig("routing.mode")}>
                    <App />
                </RouterProvider>
            </StorageProvider>
        </SessionProvider>
    </ToasterProvider>
));
