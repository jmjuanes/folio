import React from "react";
import { useMount } from "react-use";
import { Loading } from "../components/loading.jsx";
import { getLibraryStateFromInitialData } from "../lib/library.ts";
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

export type LibraryContextValue = [
    library: LibraryItem[],
    update: LibraryUpdate,
];

// @private Shared library context
export const LibraryContext = React.createContext<LibraryContextValue | null>(null);

// @description use library hook
export const useLibrary = (): LibraryContextValue => {
    return React.useContext(LibraryContext);
};

// @description Library provider component
// @param {object} store store instace for accessing and saving data
// @param {React Children} children React children to render
export const LibraryProvider = (props: LibraryProviderProps): React.JSX.Element => {
    // const [ update, setUpdate ] = React.useState<Number>(0);
    const [ currentLibrary, setCurrentLibrary ] = React.useState<LibraryItem[] | null>(null);

    // handle updating the library data
    const dispatchChange = React.useCallback((newLibrary: LibraryItem[]): void => {
        // 1. call the setCurrentLibrary to update the internal library data
        setCurrentLibrary(newLibrary);
        // 2. call the onChange method with the new library data
        if (typeof props.onChange === "function") {
            props.onChange({
                version: VERSION,
                items: newLibrary,
            });
        }
    }, [ setCurrentLibrary, props.onChange ]);

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
