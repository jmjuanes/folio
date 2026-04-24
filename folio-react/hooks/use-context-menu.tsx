import { useCallback, useContext, createContext } from "react";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useSurface, useFloating } from "../contexts/surface.tsx";
import { useEscapeKey } from "./use-key.ts";
import type { JSX } from "react";

// internal id to control displaying/removing the context menu in the surface
// note: this means that only a single context menu can be used at the same time
const CONTEXT_MENU_ID = "surface/context-menu";

export type ContextMenuPosition = { top: number, left: number };

export type ContextMenuManager = {
    showContextMenu: (top: number, left: number) => void;
    hideContextMenu: () => void;
};

// internal context to track the position of the context menu
const ContexMenuPositionContext = createContext<ContextMenuPosition | null>(null);

// wrapper around the context menu component
// it allows the internal ContextMenu component to access to its position using the useContextMenuPosition hook
export const ContextMenuWrapper = (): JSX.Element => {
    const { ContextMenu } = useEditorComponents();
    const floatingElement = useFloating();
    const { top, left } = floatingElement.getContext();

    // automatically clear the context menu when the user press the ESC key
    useEscapeKey(() => floatingElement.close());

    return (
        <ContexMenuPositionContext.Provider value={{ top: top as number, left: left as number }}>
            <ContextMenu />
        </ContexMenuPositionContext.Provider>
    );
};

// @description took to access to the position of the context menu
export const useContextMenuPosition = (): ContextMenuPosition => {
    const position = useContext(ContexMenuPositionContext);
    if (!position) {
        throw new Error("Context menu is not available.");
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
    const showContextMenu = useCallback((top: number, left: number) => {
        showInSurface(CONTEXT_MENU_ID, ContextMenuWrapper, { top, left });
    }, [showInSurface]);

    // method to remove the context menu from the surface
    const hideContextMenu = useCallback(() => {
        removeFromSurface(CONTEXT_MENU_ID);
    }, [removeFromSurface]);

    return { showContextMenu, hideContextMenu };
};
