import { useCallback, useContext, createContext } from "react";
import { useAlure as useSurface, withDismiss, withFixedPosition } from "alure";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useEditor } from "../contexts/editor.tsx";
import type { JSX } from "react";

// internal id to control displaying/removing the context menu in the surface
// note: this means that only a single context menu can be used at the same time
const CONTEXT_MENU_ID = "floating/context-menu";

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
    const { getContext } = useSurface();
    const { top, left } = getContext();
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
    const editor = useEditor();
    const { open, close } = useSurface();

    // method to display the context menu in the specified position
    const showContextMenu = useCallback((top: number, left: number) => {
        open(CONTEXT_MENU_ID, {
            component: ContextMenuWrapper,
            context: { top, left },
            middlewares: [
                withFixedPosition({
                    top: top,
                    left: left,
                    style: {
                        transform: top > editor.height / 2 ? "translateY(-100%)" : "",
                    },
                }),
                withDismiss(),
            ],
        });
    }, [editor, open, ContextMenuWrapper]);

    // method to remove the context menu from the surface
    const hideContextMenu = useCallback(() => close(CONTEXT_MENU_ID), [close]);

    return { showContextMenu, hideContextMenu };
};
