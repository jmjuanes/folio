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

// export type of the callback method used to update the internal
// library data and dispatch an onChange
export type LibraryUpdate = (newLibraryItems: LibraryItem[]) => void;

export type LibraryProviderProps = {
    data: any;
    onChange: (library: Library) => void;
    children: React.ReactNode,
};

export type LibraryApi = [
    library: LibraryItem[],
    update: LibraryUpdate,
];

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
    const api = React.useMemo(() => {
        return {
            // @description load library data from a JSON object
            // fromJSON: data => {
            //     library.current = getLibraryStateFromInitialData(data || {});
            // },
            // @description import library items from another library
            import: (newLibrary: Library) => {
                const currentItems = new Set(libraryState?.items.map(item => item.id));
                const itemsToInsert = newLibrary.items.filter(item => {
                    return !currentItems.has(item.id);
                });
                // insert items into library
                if (itemsToInsert.length > 0) {
                    setLibraryState({
                        items: libraryState?.items.concat(itemsToInsert) || itemsToInsert,
                    });
                }
            },

            // @description clear library
            clear: () => {
                setLibraryState({
                    items: [],
                });
            },

            // @description add a new item to the library
            addItem: (elements: any, data: any) => {
                return createLibraryItem(elements, data).then(libraryItem => {
                    setLibraryState({
                        items: (libraryState?.items || []).concat([libraryItem]),
                    });
                });
            },

            // @description remove a library item
            removeItem: (id: string | string[]) => {
                const idsToRemove = new Set([id].flat());
                setLibraryState({
                    items: (libraryState?.items || []).filter(item => {
                        return !idsToRemove.has(item.id);
                    }),
                });
            },

            // @description get a library item
            getItem: (id: string): LibraryItem | null => {
                return libraryState?.items.find(item => item.id === id) || null;
            },

            // @description get all library items
            getItems: (): LibraryItem[] => {
                return libraryState?.items || [];
            },
        };
    }, [ libraryState, setLibraryState ]);

    // dispatch a change every time the library state is updated
    React.useEffect(() => {
        if (typeof props.onChange === "function" && libraryState) {
            props.onChange({
                version: VERSION,
                items: libraryState?.items || [],
            });
        }
    }, [ libraryState ]);

    // On mount, import library data
    // TODO: we would need to handle errors when importing editor data
    useMount(() => {
        promisifyValue(props.data)
            .then(data => {
                return getLibraryStateFromInitialData(data || {});
            })
            .then(libraryData => {
                setCurrentLibrary(libraryData?.items || []);
            })
            .catch(error => {
                console.error(error);
                setCurrentLibrary([]);
            });
    });

    // If library data is not available (yet), do not render
    if (!currentLibrary) {
        return <Loading />;
    }

    // Render library context provider
    return (
        <LibraryContext.Provider value={[ currentLibrary, dispatchChange ]}>
            {props.children}
        </LibraryContext.Provider>
    );
};
