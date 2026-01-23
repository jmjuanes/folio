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
    load: (data: Library) => void;
    export: () => Library;
    exportCollection: (collectionId: string) => Library;
    clear: () => void;
    addItem: (elements: any, data: Partial<LibraryItem>) => void;
    editItem: (id: string, data: Partial<LibraryItem>) => void;
    removeItem: (id: string) => void;
    addCollection: (data: Partial<LibraryCollection>) => void;
    editCollection: (id: string, data: Partial<LibraryCollection>) => void;
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
            load: (data: Library) => {
                setLibraryState((prevLibrary: Library) => {
                    // 1. clone items and collections
                    const currentItems = (prevLibrary?.items || []).slice(0);
                    const currentCorrections = (prevLibrary?.collections || []).slice(0);
                    // 2. merge items into currentItems array
                    const itemsIds = new Set(currentItems.map(item => item.id));
                    (data?.items || []).forEach(item => {
                        if (!itemsIds.has(item.id)) {
                            currentItems.push(item);
                            itemsIds.add(item.id);
                        }
                    });
                    // 3. merge collections into currentCollections array
                    const collectionsIds = new Set(currentCorrections.map(collection => collection.id));
                    (data?.collections || []).forEach(collection => {
                        if (!collectionsIds.has(collection.id)) {
                            currentCorrections.push(collection);
                            collectionsIds.add(collection.id);
                        }
                    });
                    // 4. return new merged state
                    return {
                        items: currentItems,
                        collections: currentCorrections,
                    };
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
            addItem: (elements: any, data: Partial<LibraryItem>) => {
                createLibraryItem(elements, data).then(libraryItem => {
                    setLibraryState((prevState: Library) => ({
                        items: [...(prevState?.items || []), libraryItem],
                        collections: prevState?.collections || [],
                    }));
                });
            },

            // @description edit a library item
            editItem: (itemId: string, itemData: Partial<LibraryItem>) => {
                setLibraryState((prevState: Library) => {
                    const item = (prevState.items || []).find((item: LibraryItem) => item.id === itemId);
                    if (item) {
                        Object.assign(item, itemData || {});
                    }
                    // return a cloned state object
                    return {...prevState};
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
            addCollection: (data: Partial<LibraryCollection>) => {
                const collection: LibraryCollection = createLibraryCollection(data);
                setLibraryState((prevState: Library) => ({
                    items: prevState?.items || [],
                    collections: [...(prevState?.collections || []), collection],
                }));
            },

            // @description edit the specified collection
            editCollection: (collectionId: string, collectionData: Partial<LibraryCollection>) => {
                setLibraryState((prevState: Library) => {
                    const collection = prevState.collections.find((collection: LibraryCollection) => {
                        return collection.id === collectionId;
                    });
                    if (collection) {
                        Object.assign(collection, collectionData || {});
                    }
                    return {...prevState};
                });
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
