import React from "react";

// @private context to share library items with other elements in canvas
export const LibraryItemsContext = React.createContext(null);

// @description get a library item
export const useLibraryItem = id => {
    return React.useContext(LibraryItemsContext)?.get(id);
};

// @description library items provider
export const LibraryItemsProvider = props => {
    const libraryItems = React.useMemo(() => {
        return new Map((props.value || []).map(item => [item.id, item]));
    }, [props.value?.length]);
    return (
        <LibraryItemsContext.Provider value={libraryItems}>
            {props.children}
        </LibraryItemsContext.Provider>
    );
};
