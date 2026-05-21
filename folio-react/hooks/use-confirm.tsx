import { useCallback } from "react";
import { useAlure as useSurface } from "alure";
import { Button, ButtonVariant } from "../components/ui/button.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { useDialog } from "./use-dialog.tsx";
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
    const { close, getContext } = useSurface();
    const context = getContext();

    const handleSubmit = useCallback(() => {
        if (typeof context?.onSubmit === "function") {
            context.onSubmit();
        }
        if (typeof context?.callback === "function") {
            context.callback();
        }
        close();
    }, [context?.onSubmit, context?.callback, close]);

    const handleCancel = useCallback(() => {
        if (typeof context?.onCancel === "function") {
            context.onCancel();
        }
        close();
    }, [context?.onCancel, close]);

    return (
        <Dialog.Content className="w-full max-w-lg relative">
            {context?.title && (
                <Dialog.Header>
                    <Dialog.Title>{context.title}</Dialog.Title>
                    <Dialog.Close onClick={() => close()} />
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
        </Dialog.Content>
    );
};

// export hook to display a confirmation dialog
export const useConfirm = (): Confirm => {
    const { showDialog } = useDialog();

    // method to display a confirmation 
    return useCallback((options: ConfirmOptions) => {
        showDialog(ConfirmWrapper, options);
    }, [showDialog]);
};
