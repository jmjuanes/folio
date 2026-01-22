import React from "react";
import { useMount } from "react-use";
import { Loading } from "../components/loading.jsx";
import {
    getLibraryStateFromInitialData,
    createLibraryItem,
    createLibraryCollection,
} from "../lib/library.ts";
import { promisifyValue } from "../utils/promises.js";
import { VERSION } from "../constants.js";
import type { Library, LibraryItem, LibraryCollection } from "../lib/library.ts";

export type LibraryProviderProps = {
    data: any;
    onChange: (library: Library) => void;
    children: React.ReactNode,
};

export type LibraryApi = {
    count: number;
    load: (libraryData: Library) => void;
    export: () => Library;
    exportCollection: (collectionId: string) => Library;
    clear: () => void;
    addItem: (elements: any, data: any) => void;
    removeItem: (id: string) => void;
    addCollection: (data: any) => void;
    removeCollection: (id: string) => void;
    getItem: (id: string) => LibraryItem | null;
    getItems: () => LibraryItem[];
    getCollections: () => LibraryCollection[];
    getCollection: (collectionId: string) => LibraryCollection | null;
    getCollectionItems: (collectionId: string) => LibraryItem[];
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
    const libraryApi = React.useMemo<LibraryApi>(() => {
        return {
            count: libraryState?.items.length || 0,

            // @description load library data from a JSON object
            load: (libraryData: Library) => {
                setLibraryState({
                    items: libraryData?.items || [],
                    collection: libraryData?.collections || [],
                });
            },

            // @description export library
            export: () => {
                return {
                    items: libraryState?.items || [],
                    collections: libraryState?.collections || [],
                    version: VERSION,
                };
            },

            // @description export a single collection
            exportCollection: (collectionId: string): Library => {
                return {
                    version: VERSION,
                    items: (libraryState?.items || []).filter((item: LibraryItem) => {
                        return item.collection === collectionId;
                    }),
                    collections: (libraryState?.collections || []).filter((collection: LibraryCollection) => {
                        return collection.id === collectionId;
                    }),
                };
            },

            // @description clear library
            clear: () => {
                setLibraryState({
                    items: [],
                    collections: [],
                });
            },

            // @description add a new item to the library
            addItem: (elements: any, data: any) => {
                createLibraryItem(elements, data).then(libraryItem => {
                    setLibraryState((prevState: Library) => ({
                        items: [...(prevState?.items || []), libraryItem],
                        collections: prevState?.collections || [],
                    }));
                });
            },

            // @description remove a library item
            removeItem: (id: string) => {
                setLibraryState((prevState: Library) => {
                    const itemToRemove = (prevState?.items || []).find(item => item.id === id) as LibraryItem;
                    return {
                        items: (prevState?.items || []).filter(item => {
                            return item.id !== id;
                        }),
                        collections: (prevState?.collections || []).filter((collection: LibraryCollection) => {
                            const itemsInCollection = (prevState?.items || []).filter((item: LibraryItem) => {
                                return item.collection === collection.id;
                            });
                            // 1. the collection has a single item, and is the item we are removing
                            if (itemsInCollection.length === 1 && itemToRemove.collection === collection.id) {
                                return false;
                            }
                            // 2. filter empty collections
                            return itemsInCollection.length > 0;
                        }),
                    };
                });
            },

            // @description add a new collection
            addCollection: (data: any) => {
                const collection: LibraryCollection = createLibraryCollection(data);
                setLibraryState((prevState: Library) => ({
                    items: prevState?.items || [],
                    collections: [...(prevState?.collections || []), collection],
                }));
            },

            // @description remove the specified collection
            removeCollection: (id: string) => {
                setLibraryState((prevState: Library) => ({
                    items: (prevState?.items || []).filter((item: LibraryItem) => {
                        return item.collection !== id;
                    }),
                    collections: (prevState?.collections || []).filter((collection: LibraryCollection) => {
                        return collection.id !== id;
                    }),
                }));
            },

            // @description get a library item
            getItem: (id: string): LibraryItem | null => {
                return (libraryState?.items || []).find((item: LibraryItem) => item.id === id) || null;
            },

            // @description get all library items
            getItems: (): LibraryItem[] => {
                return libraryState?.items || [];
            },

            // @description get available collections
            getCollections: (): LibraryCollection[] => {
                return libraryState.collections || [];
            },

            // @description get collection information
            getCollection: (collectionId: string): LibraryCollection | null => {
                return (libraryState?.collections || []).find((collection: LibraryCollection) => {
                    return collection.id === collectionId;
                }) || null;
            },

            // @description get items in the provided collection
            getCollectionItems: (collectionId: string): LibraryItem[] => {
                return (libraryState?.items || []).filter((item: LibraryItem) => {
                    return item.collection === collectionId;
                });
            },
        } as LibraryApi;
    }, [ libraryState ]);

    // dispatch a change every time the library state is updated
    React.useEffect(() => {
        if (typeof props.onChange === "function" && libraryState) {
            props.onChange({
                version: VERSION,
                items: libraryState?.items || [],
                collections: libraryState?.collections || [],
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
                    collections: libraryData?.collections || [],
                });
            })
            .catch((error: any) => {
                console.error(error);
                setLibraryState({
                    items: [],
                    collections: [],
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
