import React from "react";
import { Button, ButtonVariant } from "../components/ui/button.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { useDialog } from "./use-dialog.tsx";
import { useSurfaceSlot, useSurfaceSlotContext } from "../contexts/surface.tsx";

export type ConfirmOptions = {
    title?: string;
    message?: string | React.JSX.Element;
    confirmText?: string;
    cancelText?: string;
    callback?: () => void; // DEPRECATED
    onSubmit?: () => void;
    onCancel?: () => void;
};

export type Confirm = (options: ConfirmOptions) => void;

export const ConfirmWrapper = (): React.JSX.Element => {
    const { hideSurfaceSlot } = useSurfaceSlot();
    const surfaceSlotContext = useSurfaceSlotContext();

    const handleSubmit = React.useCallback(() => {
        if (typeof surfaceSlotContext?.data?.onSubmit === "function") {
            surfaceSlotContext.data.onSubmit();
        }
        if (typeof surfaceSlotContext?.data?.callback === "function") {
            surfaceSlotContext.data.callback();
        }
        hideSurfaceSlot();
    }, [surfaceSlotContext?.data?.onSubmit, surfaceSlotContext?.data?.callback, hideSurfaceSlot]);

    const handleCancel = React.useCallback(() => {
        if (typeof surfaceSlotContext?.data?.onCancel === "function") {
            surfaceSlotContext.data.onCancel();
        }
        hideSurfaceSlot();
    }, [surfaceSlotContext?.data?.onCancel, hideSurfaceSlot]);

    return (
        <React.Fragment>
            {surfaceSlotContext?.data?.title && (
                <Dialog.Header>
                    <Dialog.Title>{surfaceSlotContext.data.title}</Dialog.Title>
                </Dialog.Header>
            )}
            <Dialog.Body>
                {surfaceSlotContext?.data?.message && (
                    <Dialog.Description>
                        {surfaceSlotContext?.data?.message}
                    </Dialog.Description>
                )}
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant={ButtonVariant.SECONDARY} onClick={handleCancel}>
                    {surfaceSlotContext?.data?.cancelText || "Cancel"}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={handleSubmit}>
                    {surfaceSlotContext?.data?.confirmText || "Confirm"}
                </Button>
            </Dialog.Footer>

        </React.Fragment>
    );
};

// export hook to display a confirmation dialog
export const useConfirm = (): Confirm => {
    const { showDialog } = useDialog();

    // method to display a confirmation 
    return React.useCallback((options: ConfirmOptions) => {
        showDialog(ConfirmWrapper, {
            ...options,
            dialogClassName: "max-w-lg relative",
        });
    }, [showDialog]);
};
