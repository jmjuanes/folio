import React from "react";
import {useEditorComponents} from "./editor-components.jsx";

// @description internal context to allow editor show/hide the context menu
const ContextMenuContext = React.createContext(null);

// @description hook to access to the context menu
// @returns {object} contextMenu object
// @returns {function} contextMenu.showContextMenu function to show the context menu
// @returns {function} contextMenu.hideContextMenu function to hide the context menu
export const useContextMenu = () => {
    return React.useContext(ContextMenuContext);
};

// @description context menu provider component
// @param {React Children} children React children to render
export const ContextMenuProvider = ({children}) => {
    const [contextMenuPosition, setContextMenuPosition] = React.useState(null);
    const {ContextMenu} = useEditorComponents();

    // internal callback to display the context menu at the specified position
    const showContextMenu = React.useCallback((top, left) => {
        setContextMenuPosition({top, left});
    }, [setContextMenuPosition]);

    // internal callback to hide the context menu
    const hideContextMenu = React.useCallback(() => {
        setContextMenuPosition(null);
    }, [setContextMenuPosition]);

    // Render context menu context provider
    return (
        <ContextMenuContext.Provider value={{showContextMenu, hideContextMenu}}>
            {children}
            {contextMenuPosition && !!ContextMenu && (
                <ContextMenu {...contextMenuPosition} />
            )}
        </ContextMenuContext.Provider>
    );
};
