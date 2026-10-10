import { useState, useRef, useMemo, useCallback, useEffect } from "react";
// import { PREFERENCES } from "folio-react/constants.js";
import { Editor } from "folio-react/components/editor.tsx";
import { Title } from "folio-react/components/title.tsx";
// import { Library } from "folio-react/components/library.tsx";
import { Preferences as PreferencesDialog, PreferencesContent } from "folio-react/components/preferences.tsx";
import { NotFound } from "./NotFound.tsx";
import type { JSX } from "react";

// internal method to change the document title
// const setDocumentTitle = (title: string) => {
//     document.title = `${title} - folio lite`;
// };

export type BoardProps = {
    readonly?: boolean;
    preferences?: any;
    onDataLoad?: () => Promise<any>;
    onDataChange?: (data: any) => void;
    onPreferencesChange?: (preferences: any) => void;
};

export const Board = (props : BoardProps): JSX.Element => {
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState<any>(props.preferences || {});
    // const currentTitle = useRef<string>("Untitled");
    // we are using a reference to the initial preferences to prevent saving the same loaded preferences
    // when the component is initialized
    const initialPreferences = useRef<any>(props.preferences || {});

    // generate components overrides
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

    // merge user preferences with pre-defined preferences of the application
    // const mergedPreferences = useMemo(() => {
    //     return {
    //         ...preferences,
    //     };
    // }, [preferences]);

    // this is a wrapper around store.getInitialData to get and update the document title
    const handleDataLoad = useCallback(() => {
        if (typeof props.onDataLoad === "function") {
            return props.onDataLoad().catch((error: any) => {
                setError(error);
            });
        }
        // if no data load function is provided, return an empty object
        return Promise.resolve({});
    }, [props.onDataLoad, setError]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = useCallback((data: any) => {
        if (typeof props.onDataChange === "function") {
            props.onDataChange(data);
        }
        // update the document title if it has changed
        // if (data?.title && data.title !== currentTitle.current) {
        //     setDocumentTitle(data.title);
        //     currentTitle.current = data.title;
        // }
    }, [props.onDataChange]);

    // when the library in the editor changes, run store.updateLibrary
    // const handleLibraryChange = useCallback((library: any) => {
    //     props.store.updateLibrary(library);
    // }, [props.store]);

    // when preferences change, call useEffect to update the preferences storage
    useEffect(() => {
        if (typeof props.onPreferencesChange === "function") {
            if (preferences && preferences !== initialPreferences.current) {
                props.onPreferencesChange(preferences);
            }
        }
    }, [props.onPreferencesChange, preferences]);

    if (error) {
        return <NotFound />
    }

    return (
        <Editor
            readonly={!!props.readonly}
            data={handleDataLoad}
            onChange={handleDataChange}
            components={componentsOverrides}
            preferences={preferences}
        />
    );
};
