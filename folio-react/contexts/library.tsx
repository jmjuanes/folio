import React from "react";
import { useMount } from "react-use";
import { Loading } from "../components/loading.jsx";
import {
    getLibraryStateFromInitialData,
    createLibraryItem,
} from "../lib/library.ts";
import { promisifyValue } from "../utils/promises.js";
import { VERSION } from "../constants.js";
import type { Library, LibraryItem } from "../lib/library.ts";

export type LibraryProviderProps = {
    data: any;
    onChange: (library: Library) => void;
    children: React.ReactNode,
};

export type LibraryApi = {
    count: number;
    load: (libraryData: Library) => void;
    export: () => Library;
    clear: () => void;
    addItem: (elements: any, data: any) => void;
    removeItem: (id: string) => void;
    getItem: (id: string) => LibraryItem | null;
    getItems: () => LibraryItem[];
};

// @private Shared library context
export const LibraryContext = React.createContext<LibraryApi | null>(null);

// @description use library hook
export const useLibrary = (): LibraryApi | null => {
    return React.useContext(LibraryContext);
};

// @description Library provider component
// @param {object} store store instace for accessing and saving data
// @param {React Children} children React children to render
export const LibraryProvider = (props: LibraryProviderProps): React.JSX.Element => {
    const [ libraryState, setLibraryState ] = React.useState<Library | null>(null);

    // create the api to manage the library data
    const libraryApi = React.useMemo(() => {
        return {
            count: libraryState?.items.length || 0,

            // @description load library data from a JSON object
            load: (libraryData: Library) => {
                setLibraryState({
                    items: libraryData?.items || [],
                });
            },

            // @description export library
            export: () => {
                return {
                    items: libraryState?.items || [],
                    version: VERSION,
                };
            },

            // @description clear library
            clear: () => {
                setLibraryState({
                    items: [],
                });
            },

            // @description add a new item to the library
            addItem: (elements: any, data: any) => {
                createLibraryItem(elements, data).then(libraryItem => {
                    setLibraryState({
                        items: [...(libraryState?.items || []), libraryItem],
                    });
                });
            },

            // @description remove a library item
            removeItem: (id: string) => {
                setLibraryState({
                    items: (libraryState?.items || []).filter(item => {
                        return item.id !== id;
                    }),
                });
            },

            // @description get a library item
            getItem: (id: string): LibraryItem | null => {
                return (libraryState?.items || []).find((item: LibraryItem) => item.id === id) || null;
            },

            // @description get all library items
            getItems: (): LibraryItem[] => {
                return libraryState?.items || [];
            },
        };
    }, [ libraryState ]);

    // dispatch a change every time the library state is updated
    React.useEffect(() => {
        if (typeof props.onChange === "function" && libraryState) {
            props.onChange({
                version: VERSION,
                items: libraryState?.items || [],
            });
        }
    }, [ libraryState ]);

    // on mount, import library data
    useMount(() => {
        promisifyValue(props.data)
            .then((data: any) => {
                return getLibraryStateFromInitialData(data || {});
            })
            .then((libraryData: Partial<Library>) => {
                setLibraryState({
                    items: libraryData?.items || [],
                });
            })
            .catch((error: any) => {
                console.error(error);
                setLibraryState({
                    items: [],
                });
            });
    });

    // if library data is not available (yet), do not render
    if (!libraryState) {
        return <Loading />;
    }

    // render library context provider
    return (
        <LibraryContext.Provider value={libraryApi}>
            {props.children}
        </LibraryContext.Provider>
    );
};
