import React from "react";
import { useEditorComponents } from "./editor-components.tsx";

export type ContextMenuProviderProps = {
    children: React.ReactNode;
};

export type ContextMenuPosition = {
    top: number;
    left: number;
};

export type ContextMenuManager = {
    showContextMenu: (top: number, left: number) => void;
    hideContextMenu: () => void;
    getContextMenuPosition: () => ContextMenuPosition | null;
};

// @description internal context to allow editor show/hide the context menu
const ContextMenuContext = React.createContext<ContextMenuManager | null>(null);

// @description hook to access to the context menu
// @returns {object} contextMenu object
// @returns {function} contextMenu.showContextMenu function to show the context menu
// @returns {function} contextMenu.hideContextMenu function to hide the context menu
export const useContextMenu = (): ContextMenuManager => {
    const contextMenuManager =  React.useContext(ContextMenuContext);
    if (!contextMenuManager) {
        throw new Error("Cannot call 'useContextMenu' outside <ContextMenuProvider>.");
    }
    return contextMenuManager;
};

// @description context menu provider component
// @param {React Children} children React children to render
export const ContextMenuProvider = (props: ContextMenuProviderProps): React.JSX.Element => {
    const [contextMenuPosition, setContextMenuPosition] = React.useState<ContextMenuPosition | null>(null);
    const { ContextMenu } = useEditorComponents();

    // internal callback to display the context menu at the specified position
    const showContextMenu = React.useCallback((top: number, left: number) => {
        setContextMenuPosition({ top, left });
    }, [setContextMenuPosition]);

    // internal callback to hide the context menu
    const hideContextMenu = React.useCallback(() => {
        setContextMenuPosition(null);
    }, [setContextMenuPosition]);

    // internal method to get the current context menu position
    const getContextMenuPosition = React.useCallback(() => {
        return contextMenuPosition;
    }, [contextMenuPosition]);

    // Render context menu context provider
    return (
        <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu, getContextMenuPosition }}>
            {props.children}
            {contextMenuPosition && !!ContextMenu && (
                <ContextMenu />
            )}
        </ContextMenuContext.Provider>
    );
};
