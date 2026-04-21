import { useCallback, useContext, createContext } from "react";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { Part, useWorkbench, useView, useViewContext } from "../contexts/workbench.tsx";
import { useEscapeKey } from "./use-key.ts";
import type { JSX } from "react";

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
    const view = useView();
    const viewContext = useViewContext();

    // automatically clear the context menu when the user press the ESC key
    useEscapeKey(() => view.close());

    return (
        <ContexMenuPositionContext.Provider value={{ top: viewContext.top as number, left: viewContext.left as number }}>
            <ContextMenu />
        </ContexMenuPositionContext.Provider>
    );
};

// @description took to access to the position of the context menu
export const useContextMenuPosition = (): ContextMenuPosition => {
    const position = useContext(ContexMenuPositionContext);
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
    const { openView, closeView } = useWorkbench();

    // method to display the context menu in the specified position
    const showContextMenu = useCallback((top: number, left: number) => {
        openView(Part.SURFACE, ContextMenuWrapper, { top, left });
    }, [openView]);

    // method to remove the context menu from the surface
    const hideContextMenu = useCallback(() => closeView(Part.SURFACE, ContextMenuWrapper), [closeView]);

    return { showContextMenu, hideContextMenu };
};
