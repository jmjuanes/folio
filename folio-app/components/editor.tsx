import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { PREFERENCES } from "folio-react/constants.js";
import { Editor as FolioEditor } from "folio-react/components/editor.tsx";
import { Title } from "folio-react/components/title.tsx";
// import { Library } from "folio-react/components/library.tsx";
import { Preferences as PreferencesDialog, PreferencesContent } from "folio-react/components/preferences.tsx";
import { Loading } from "folio-react/components/loading.jsx";
import type { JSX } from "react";
import type { Preferences } from "folio-react/contexts/preferences.tsx";
import type { StorageService } from "../types/service.ts";

export type EditorProps = {
    id: string;
    storage: StorageService;
};

// internal method to change the document title
// const setDocumentTitle = (title: string) => {
//     document.title = `${title} - folio lite`;
// };

export const Editor = ({ id, storage }: EditorProps): JSX.Element => {
    const [ready, setReady] = useState<boolean>(false);
    const [preferences, setPreferences] = useState<Partial<Preferences> | null>(null);
    // const currentTitle = useRef<string>("Untitled");

    // we are using a reference to the initial preferences to prevent saving the same loaded preferences
    // when the component is initialized
    const initialPreferences = useRef<object>(null);

    const componentsOverrides = useMemo(() => {
        return {
            Title: Title,
            // Library: Library,
            Preferences: () => (
                <PreferencesDialog>
                    <PreferencesContent
                        onChange={(newPreferences: any) => {
                            setPreferences((prevPreferences: any) => {
                                return Object.assign({}, prevPreferences, newPreferences);
                            });
                        }}
                    />
                </PreferencesDialog>
            ),
        };
    }, [setPreferences]);

    // default preferences for folio-lite app
    const mergedPreferences = useMemo(() => {
        return {
            [PREFERENCES.AI_ENABLED]: false,
            ...preferences,
        };
    }, [preferences]);

    // this is a wrapper around store.getInitialData to get and update the document title
    const handleDataLoad = useCallback(() => {
        storage.getDocument(id).then(data => {
            // if (data?.value?.title) {
            //     setDocumentTitle(data.title);
            //     currentTitle.current = data.title;
            // }
            return data?.value;
        });
    }, [id, storage]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = useCallback((data: any) => {
        storage.updateDocument(id, {
            value: data,
        });
        // update the document title if it has changed
        // if (data?.title && data.title !== currentTitle.current) {
        //     setDocumentTitle(data.title);
        //     currentTitle.current = data.title;
        // }
    }, [storage]);

    // when the library in the editor changes, run store.updateLibrary
    // const handleLibraryChange = useCallback((library: any) => {
    //     props.store.updateLibrary(library);
    // }, [props.store]);

    // when the component is mounted, fetch preferences
    useEffect(() => {
        storage.getPreferences()
            .then(savedPreferences => {
                initialPreferences.current = savedPreferences || {};
            })
            .catch(error => {
                console.error(error);
                initialPreferences.current = {};
            })
            .finally(() => {
                setPreferences(initialPreferences.current);
                setReady(true);
            });
    }, [id, storage]);

    // when preferences change, call useEffect to update the preferences storage
    useEffect(() => {
        if (preferences && preferences !== initialPreferences.current) {
            storage.updatePreferences(preferences);
        }
    }, [storage, preferences]);

    if (!ready || !preferences) {
        return (
            <Loading className="h-screen flex items-center justify-center" />
        );
    }

    return (
        <FolioEditor
            data={handleDataLoad}
            onChange={handleDataChange}
            components={componentsOverrides}
            preferences={mergedPreferences}
        />
    );
};
