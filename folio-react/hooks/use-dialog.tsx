import { Fragment, useCallback } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { Centered } from "../components/ui/centered.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Overlay } from "../components/ui/overlay.tsx";
import { useSurface, useFloating } from "../contexts/surface.tsx";
import { useEscapeKey } from "./use-key.ts";
import type { ElementType, JSX } from "react";

// internal id to get the reference to the dialog displayed in the surface
const DIALOG_ID = "surface/dialog";

export type DialogManager = {
    showDialog: (component: ElementType, context?: any) => void;
    hideDialog: () => void;
};

export const DialogWrapper = (): JSX.Element => {
    const floatingElement = useFloating();
    const { dialogComponent, dialogClassName } = floatingElement.getContext();
    const DialogComponent: ElementType = dialogComponent ?? Fragment;

    // when the Escape key is pressed, close the view
    useEscapeKey(() => floatingElement.close());

    return createPortal([
        <Overlay key="surface/dialog:overlay" className="z-50" />,
        <Centered key="surface/dialog:content" className="fixed z-50 h-full">
            <Dialog.Content className={classNames("relative", dialogClassName || "")}>
                <Dialog.Close onClick={() => floatingElement.close()} />
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
    const { showInSurface, removeFromSurface } = useSurface();

    // method to display the provided component inside a dialog
    const showDialog = useCallback((component: ElementType, context?: any) => {
        showInSurface(DIALOG_ID, DialogWrapper, Object.assign({}, context || {}, {
            dialogComponent: component,
        }));
    }, [showInSurface]);

    // method to hide the current dialog
    const hideDialog = useCallback(() => {
        removeFromSurface(DIALOG_ID);
    }, [removeFromSurface]);

    return { showDialog, hideDialog };
};
