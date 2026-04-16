import React from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { Centered } from "../components/ui/centered.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Overlay } from "../components/ui/overlay.tsx";
import {
    useSurface,
    useSurfaceSlotContext,
    useSurfaceSlotClearWithEscKey,
} from "../contexts/surface.tsx";

export const DIALOG_ID = "surface/dialog";

export type DialogManager = {
    showDialog: (component: React.ElementType, data: any) => void;
    hideDialog: () => void;
};

export const DialogWrapper = (): React.JSX.Element => {
    const { removeFromSurface } = useSurface();
    const surface = useSurfaceSlotContext();
    const DialogComponent = surface.component;
    useSurfaceSlotClearWithEscKey();

    return createPortal([
        <Overlay key="surface/dialog:overlay" className="z-50" />,
        <Centered key="surface/dialog:content" className="fixed z-50 h-full">
            <Dialog.Content className={classNames("relative", surface?.data?.dialogClassName)}>
                <Dialog.Close onClick={() => removeFromSurface(surface.id)} />
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
    const showDialog = React.useCallback((component: React.ElementType, data: any) => {
        showInSurface(DIALOG_ID, component, data || {});
    }, [showInSurface]);

    // method to hide the current dialog
    const hideDialog = React.useCallback(() => removeFromSurface(DIALOG_ID), [removeFromSurface]);

    return { showDialog, hideDialog };
};
