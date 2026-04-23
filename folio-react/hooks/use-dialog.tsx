import { useCallback } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { Centered } from "../components/ui/centered.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Overlay } from "../components/ui/overlay.tsx";
import { Part, useWorkbench, useView, useViewContext } from "../contexts/workbench.tsx";
import { useEscapeKey } from "./use-key.ts";
import type { ElementType, JSX } from "react";

export type DialogManager = {
    showDialog: (component: ElementType, context?: any) => void;
    hideDialog: () => void;
};

export const DialogWrapper = (): JSX.Element => {
    const view = useView();
    const viewContext = useViewContext();
    const DialogComponent = viewContext?.dialogComponent || null;

    // when the Escape key is pressed, close the view
    useEscapeKey(() => view.close());

    return createPortal([
        <Overlay key="surface/dialog:overlay" className="z-50" />,
        <Centered key="surface/dialog:content" className="fixed z-50 h-full">
            <Dialog.Content className={classNames("relative", viewContext?.dialogClassName)}>
                <Dialog.Close onClick={() => view.close()} />
                <DialogComponent />
            </Dialog.Content>
        </Centered>,
    ], document.body);
};

// @description hook to access to dialog
// @returns {object} dialog object
// @returns {function} dialog.showDialog function to show a dialog
// @returns {function} dialog.hideDialog function to hide the dialog
export const useDialog = (): DialogManager => {
    const { openView, closeView } = useWorkbench();

    // method to display the provided component inside a dialog
    const showDialog = useCallback((component: ElementType, context?: any) => {
        openView(Part.SURFACE, DialogWrapper, Object.assign({}, context || {}, {
            dialogComponent: component,
        }));
    }, [openView]);

    // method to hide the current dialog
    const hideDialog = useCallback(() => closeView(Part.SURFACE, DialogWrapper), [closeView]);

    return { showDialog, hideDialog };
};
