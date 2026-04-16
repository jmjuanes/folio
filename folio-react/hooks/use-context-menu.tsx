import React from "react";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import {
    useSurface,
    useSurfaceSlotContext,
    useSurfaceSlotClearWithEscKey,
} from "../contexts/surface.tsx";

const CONTEXT_MENU_ID = "surface/contextMenu";

export type ContextMenuPosition = { top: number, left: number };

export type ContextMenuManager = {
    showContextMenu: (top: number, left: number) => void;
    hideContextMenu: () => void;
};

// internal context to track the position of the context menu
const ContexMenuPositionContext = React.createContext<ContextMenuPosition | null>(null);

// wrapper around the context menu component
// it allows the internal ContextMenu component to access to its position using the useContextMenuPosition hook
export const ContextMenuWrapper = (): React.JSX.Element => {
    const { ContextMenu } = useEditorComponents();
    const { data } = useSurfaceSlotContext();

    // automatically clear the context menu when the user press the ESC key
    useSurfaceSlotClearWithEscKey();

    return (
        <ContexMenuPositionContext.Provider value={{ top: data.top as number, left: data.left as number }}>
            <ContextMenu />
        </ContexMenuPositionContext.Provider>
    );
};

// @description took to access to the position of the context menu
export const useContextMenuPosition = (): ContextMenuPosition => {
    const position = React.useContext(ContexMenuPositionContext);
    if (!position) {
        throw new Error("Cannot call 'useContextMenuPosition' outside ContextMenuWrapper");
    }
    return position;
};

// @description hook to access to the context menu
// @returns {object} contextMenu object
// @returns {function} contextMenu.showContextMenu function to show the context menu
// @returns {function} contextMenu.hideContextMenu function to hide the context menu
export const useContextMenu = (): ContextMenuManager => {
    const { showInSurface, removeFromSurface } = useSurface();

    // method to display the context menu in the specified position
    const showContextMenu = React.useCallback((top: number, left: number) => {
        showInSurface(CONTEXT_MENU_ID, ContextMenuWrapper, { top, left });
    }, [showInSurface]);

    // method to remove the context menu from the surface
    const hideContextMenu = React.useCallback(() => {
        removeFromSurface(CONTEXT_MENU_ID);
    }, [removeFromSurface]);

    return { showContextMenu, hideContextMenu };
};
