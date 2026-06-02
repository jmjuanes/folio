import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { PREFERENCES } from "folio-react/constants.js";
import { Editor } from "folio-react/components/editor.tsx";
import { Title } from "folio-react/components/title.tsx";
import { Library } from "folio-react/components/library.tsx";
// import { AiGenerateElements } from "folio-react/components/ai.tsx";
// import { AiProvider } from "folio-react/contexts/ai.tsx";
import { Preferences as PreferencesDialog, PreferencesContent } from "folio-react/components/preferences.tsx";
import { Loading } from "folio-react/components/loading.jsx";
import { Welcome } from "./welcome.tsx";

import type { JSX } from "react";
import type { Preferences } from "folio-react/contexts/preferences.tsx";
import type { Store } from "../types/store.ts";

export type AppProps = {
    store: Store;
};

// internal method to change the document title
const setDocumentTitle = (title: string) => {
    document.title = `${title} - folio lite`;
};

export const App = (props: AppProps): JSX.Element => {
    const [ready, setReady] = useState<boolean>(false);
    const [preferences, setPreferences] = useState<Partial<Preferences> | null>(null);
    const currentTitle = useRef<string>("Untitled");

    const componentsOverrides = useMemo(() => {
        return {
            Title: Title,
            Library: Library,
            OverTheCanvas: Welcome,
            Preferences: () => (
                <PreferencesDialog>
                    <PreferencesContent
                        onChange={(newPreferences) => {
                            setPreferences((prevPreferences) => {
                                return Object.assign({}, prevPreferences, newPreferences);
                            });
                        }}
                    />
                </PreferencesDialog>
            ),
            // AiGenerateElements: AiGenerateElements,
        };
    }, [props.store, setPreferences]);

    // default preferences for folio-lite app
    const mergedPreferences = useMemo(() => {
        return {
            [PREFERENCES.AI_ENABLED]: true,
            ...preferences,
        };
    }, [props.store, preferences]);

    // this is a wrapper around store.getInitialData to get and update the document title
    const handleDataLoad = useCallback(() => {
        return props.store.getInitialData().then((data) => {
            if (data?.title) {
                setDocumentTitle(data.title);
                currentTitle.current = data.title;
            }
            return data;
        });
    }, [props.store]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = useCallback((data: any) => {
        props.store.updateData(data);
        // update the document title if it has changed
        if (data?.title && data.title !== currentTitle.current) {
            setDocumentTitle(data.title);
            currentTitle.current = data.title;
        }
    }, [props.store]);

    // when the library in the editor changes, run store.updateLibrary
    const handleLibraryChange = useCallback((library: any) => {
        props.store.updateLibrary(library);
    }, [props.store]);

    // on mount, initialize the store
    useEffect(() => {
        props.store.initialize()
            .then(() => {
                return props.store.getInitialPreferences();
            })
            .then((initialPreferences: Partial<Preferences>) => {
                setPreferences(initialPreferences || {});
                setReady(true);
            });
    }, [props.store]);

    // when preferences change, call useEffect to update the preferences storage
    useEffect(() => {
        if (preferences) {
            props.store.updatePreferences(preferences);
        }
    }, [preferences]);

    if (!ready || !preferences) {
        return (
            <Loading className="h-screen flex items-center justify-center" />
        );
    }

    return (
        <Editor
            data={handleDataLoad}
            library={props.store.getInitialLibrary}
            onChange={handleDataChange}
            onLibraryChange={handleLibraryChange}
            components={componentsOverrides}
            preferences={mergedPreferences}
        />
    );
};
