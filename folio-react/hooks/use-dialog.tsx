import { Fragment, useCallback } from "react";
import { useAlure as useSurface, withDismiss, withPortal } from "alure";
import { Centered } from "../components/ui/centered.tsx";
import { Overlay } from "../components/ui/overlay.tsx";
import type { ElementType, JSX } from "react";

// internal id to get the reference to the dialog displayed in the surface
const DIALOG_ID = "floating/dialog";

export type DialogManager = {
    showDialog: (component: ElementType, context?: any) => void;
    hideDialog: () => void;
};

export const DialogWrapper = (): JSX.Element => {
    const { close, getContext } = useSurface();
    const Component = getContext().component as ElementType;
    return (
        <Fragment>
            <Overlay key="floating/dialog:overlay" className="z-50" onClick={() => close()} />
            <Centered key="floating/dialog:content" className="fixed z-50 h-full">
                <Component />
            </Centered>
        </Fragment>
    );
};

// @description hook to access to dialog
// @returns {object} dialog object
// @returns {function} dialog.showDialog function to show a dialog
// @returns {function} dialog.hideDialog function to hide the dialog
export const useDialog = (): DialogManager => {
    const { open, close } = useSurface();

    // method to display the provided component inside a dialog
    const showDialog = useCallback((component: ElementType, context: any = {}) => {
        open(DIALOG_ID, {
            component: DialogWrapper,
            context: {
                component: component,
                ...context
            },
            middlewares: [
                withPortal(),
                withDismiss(),
            ],
        });
    }, [open]);

    // method to hide the current dialog
    const hideDialog = useCallback(() => close(DIALOG_ID), [close]);

    return { showDialog, hideDialog };
};
