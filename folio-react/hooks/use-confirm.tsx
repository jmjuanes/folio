import { useCallback, Fragment } from "react";
import { Button, ButtonVariant } from "../components/ui/button.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { useDialog } from "./use-dialog.tsx";
import { useFloating } from "../contexts/surface.tsx";
import type { JSX } from "react";

export type ConfirmOptions = {
    title?: string;
    message?: string | JSX.Element;
    confirmText?: string;
    cancelText?: string;
    callback?: () => void; // DEPRECATED
    onSubmit?: () => void;
    onCancel?: () => void;
};

export type Confirm = (options: ConfirmOptions) => void;

export const ConfirmWrapper = (): JSX.Element => {
    const floatingElement = useFloating();
    const context = floatingElement.getContext();

    const handleSubmit = useCallback(() => {
        if (typeof context?.onSubmit === "function") {
            context.onSubmit();
        }
        if (typeof context?.callback === "function") {
            context.callback();
        }
        floatingElement.close();
    }, [context?.onSubmit, context?.callback, floatingElement.close]);

    const handleCancel = useCallback(() => {
        if (typeof context?.onCancel === "function") {
            context.onCancel();
        }
        floatingElement.close();
    }, [context?.onCancel, floatingElement.close]);

    return (
        <Fragment>
            {context?.title && (
                <Dialog.Header>
                    <Dialog.Title>{context.title}</Dialog.Title>
                </Dialog.Header>
            )}
            <Dialog.Body>
                {context?.message && (
                    <Dialog.Description>
                        {context?.message}
                    </Dialog.Description>
                )}
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant={ButtonVariant.SECONDARY} onClick={handleCancel}>
                    {context?.cancelText || "Cancel"}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={handleSubmit}>
                    {context?.confirmText || "Confirm"}
                </Button>
            </Dialog.Footer>
        </Fragment>
    );
};

// export hook to display a confirmation dialog
export const useConfirm = (): Confirm => {
    const { showDialog } = useDialog();

    // method to display a confirmation 
    return useCallback((options: ConfirmOptions) => {
        showDialog(ConfirmWrapper, {
            ...options,
            dialogClassName: "max-w-lg relative",
        });
    }, [showDialog]);
};
