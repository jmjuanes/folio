import React from "react";
import { useMount } from "react-use";
import { Loading } from "../components/loading.jsx";
import {
    getLibraryStateFromInitialData,
    createLibraryComponent,
    createLibraryCollection,
} from "../lib/library.ts";
import { promisifyValue } from "../utils/promises.js";
import { VERSION } from "../constants.js";
import type { Library, LibraryComponent, LibraryCollection } from "../lib/library.ts";

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
    addComponent: (elements: any, data: Partial<LibraryComponent>) => void;
    updateComponent: (id: string, data: Partial<LibraryComponent>) => void;
    removeComponent: (id: string) => void;
    addCollection: (data: Partial<LibraryCollection>) => void;
    updateCollection: (id: string, data: Partial<LibraryCollection>) => void;
    removeCollection: (id: string) => void;
    getComponent: (id: string) => LibraryComponent | null;
    getComponents: () => LibraryComponent[];
    getCollections: () => LibraryCollection[];
    getCollection: (collectionId: string) => LibraryCollection | null;
    getCollectionComponents: (collectionId: string) => LibraryComponent[];
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
            count: (libraryState?.components.length || 0) + (libraryState?.collections.length || 0),

            // @description load library data from a JSON object
            load: (data: Library) => {
                setLibraryState((prevLibrary: Library) => {
                    // 1. clone items and collections
                    const currentItems = (prevLibrary?.components || []).slice(0);
                    const currentCorrections = (prevLibrary?.collections || []).slice(0);
                    // 2. merge items into currentItems array
                    const itemsIds = new Set(currentItems.map(item => item.id));
                    (data?.components || []).forEach(item => {
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
                        components: currentItems,
                        collections: currentCorrections,
                    };
                });
            },

            // @description export library
            export: () => {
                return {
                    components: libraryState?.components || [],
                    collections: libraryState?.collections || [],
                    version: VERSION,
                };
            },

            // @description export a single collection
            exportCollection: (collectionId: string): Library => {
                return {
                    version: VERSION,
                    components: (libraryState?.components || []).filter((item: LibraryComponent) => {
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
                    components: [],
                    collections: [],
                });
            },

            // @description add a new component to the library
            addComponent: (elements: any, data: Partial<LibraryComponent>) => {
                createLibraryComponent(elements, data).then(component => {
                    setLibraryState((prevState: Library) => ({
                        components: [...(prevState?.components || []), component],
                        collections: prevState?.collections || [],
                    }));
                });
            },

            // @description update a library component
            updateComponent: (itemId: string, itemData: Partial<LibraryComponent>) => {
                setLibraryState((prevState: Library) => ({
                    ...prevState,
                    components: (prevState?.components || []).map((item: LibraryComponent) => {
                        if (item.id === itemId) {
                            return Object.assign(item, {
                                name: itemData?.name ?? item.name,
                                description: itemData?.description ?? item.description ?? "",
                                collection: itemData?.collection ?? item.collection ?? null,
                            });
                        }
                        return item;
                    }),
                }));
            },

            // @description remove a library component
            removeComponent: (id: string) => {
                setLibraryState((prevState: Library) => {
                    const itemToRemove: LibraryComponent = (prevState?.components || []).find((item: LibraryComponent) => {
                        return item.id === id;
                    });
                    return {
                        components: (prevState?.components || []).filter(item => {
                            return item.id !== id;
                        }),
                        collections: (prevState?.collections || []).filter((collection: LibraryCollection) => {
                            const itemsInCollection = (prevState?.components || []).filter((item: LibraryComponent) => {
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
                    components: prevState?.components || [],
                    collections: [...(prevState?.collections || []), collection],
                }));
            },

            // @description update the specified collection
            updateCollection: (collectionId: string, collectionData: Partial<LibraryCollection>) => {
                setLibraryState((prevState: Library) => ({
                    ...prevState,
                    collections: (prevState?.collections || []).map((collection: LibraryCollection) => {
                        if (collection?.id === collectionId) {
                            return Object.assign(collection, {
                                name: collectionData?.name ?? collection?.name ?? "",
                                description: collectionData?.description ?? collection?.description ?? "",
                            });
                        }
                        return collection;
                    }),
                }));
            },

            // @description remove the specified collection
            removeCollection: (id: string) => {
                setLibraryState((prevState: Library) => ({
                    components: (prevState?.components || []).filter((item: LibraryComponent) => {
                        return item.collection !== id;
                    }),
                    collections: (prevState?.collections || []).filter((collection: LibraryCollection) => {
                        return collection.id !== id;
                    }),
                }));
            },

            // @description get a library item
            getComponent: (id: string): LibraryComponent | null => {
                return (libraryState?.components || []).find((item: LibraryComponent) => {
                    return item.id === id;
                });
            },

            // @description get all library items
            getComponents: (): LibraryComponent[] => {
                return libraryState?.components || [];
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
            getCollectionComponents: (collectionId: string): LibraryComponent[] => {
                return (libraryState?.components || []).filter((item: LibraryComponent) => {
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
                components: libraryState?.components || libraryState?.items || [],
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
                    components: libraryData?.components || libraryData?.items || [],
                    collections: libraryData?.collections || [],
                });
            })
            .catch((error: any) => {
                console.error(error);
                setLibraryState({
                    components: [],
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
