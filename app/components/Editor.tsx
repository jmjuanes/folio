import { useState, useRef, useMemo, useCallback, useEffect } from "react";
// import { PREFERENCES } from "folio-react/constants.js";
import { Editor as FolioEditor } from "folio-react/components/editor.tsx";
import { Title } from "folio-react/components/title.tsx";
// import { Library } from "folio-react/components/library.tsx";
import { Preferences as PreferencesDialog, PreferencesContent } from "folio-react/components/preferences.tsx";
import { Loading } from "folio-react/components/loading.jsx";
import type { JSX } from "react";
import type { Preferences } from "folio-react/contexts/preferences.tsx";
import type { StorageClient } from "../types/clients.ts";

import * as styles from "../styles/components.css";

export type EditorProps = {
    dataId: string;
    preferencesId: string;
    storage: StorageClient;
};

// internal method to change the document title
// const setDocumentTitle = (title: string) => {
//     document.title = `${title} - folio lite`;
// };

export const Editor = ({ dataId, preferencesId, storage }: EditorProps): JSX.Element => {
    const [ready, setReady] = useState<boolean>(false);
    const [preferences, setPreferences] = useState<any>(null);
    // const currentTitle = useRef<string>("Untitled");

    // we are using a reference to the initial preferences to prevent saving the same loaded preferences
    // when the component is initialized
    const initialPreferences = useRef<any>(null);
    const initialData = useRef<any>(null);

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
            // [PREFERENCES.AI_ENABLED]: false,
            ...preferences,
        };
    }, [preferences]);

    // this is a wrapper around store.getInitialData to get and update the document title
    const handleDataLoad = useCallback(() => {
        return storage.get(dataId).then(data => {
            // if (data?.value?.title) {
            //     setDocumentTitle(data.title);
            //     currentTitle.current = data.title;
            // }
            initialData.current = data;
            return data?.value || {};
        });
    }, [dataId, storage]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = useCallback((data: any) => {
        // TODO: we have to include the metadata in the data submitted to the storage
        storage.update(dataId, {
            value: data,
            metadata: {
                ...(initialData?.current?.metadata || {}),
                updated_at: Date.now(),
            },
        });
        // update the document title if it has changed
        // if (data?.title && data.title !== currentTitle.current) {
        //     setDocumentTitle(data.title);
        //     currentTitle.current = data.title;
        // }
    }, [dataId, storage]);

    // when the library in the editor changes, run store.updateLibrary
    // const handleLibraryChange = useCallback((library: any) => {
    //     props.store.updateLibrary(library);
    // }, [props.store]);

    // when the component is mounted, fetch preferences
    useEffect(() => {
        storage.get(preferencesId)
            .then(data => {
                initialPreferences.current = data || {};
            })
            .catch(error => {
                console.error(error);
                initialPreferences.current = {};
            })
            .finally(() => {
                setPreferences(initialPreferences.current?.value || {});
                setReady(true);
            });
    }, [preferencesId, storage]);

    // when preferences change, call useEffect to update the preferences storage
    useEffect(() => {
        if (preferences && preferences !== initialPreferences.current?.value) {
            storage.update(preferencesId, {
                value: preferences,
                metadata: {
                    updated_at: Date.now(),
                },
            });
        }
    }, [storage, preferences]);

    if (!ready || !preferences) {
        return (
            <Loading className={styles.loading} />
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
