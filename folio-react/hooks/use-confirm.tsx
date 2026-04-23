import { useCallback, Fragment } from "react";
import { Button, ButtonVariant } from "../components/ui/button.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { useDialog } from "./use-dialog.tsx";
import { useView, useViewContext } from "../contexts/workbench.tsx";
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
    const view = useView();
    const viewContext = useViewContext();

    const handleSubmit = useCallback(() => {
        if (typeof viewContext?.onSubmit === "function") {
            viewContext.onSubmit();
        }
        if (typeof viewContext?.callback === "function") {
            viewContext.callback();
        }
        view.close();
    }, [viewContext?.onSubmit, viewContext?.callback, view?.close]);

    const handleCancel = useCallback(() => {
        if (typeof viewContext?.onCancel === "function") {
            viewContext.onCancel();
        }
        view.close();
    }, [viewContext?.onCancel, view?.close]);

    return (
        <Fragment>
            {viewContext?.title && (
                <Dialog.Header>
                    <Dialog.Title>{viewContext.title}</Dialog.Title>
                </Dialog.Header>
            )}
            <Dialog.Body>
                {viewContext?.message && (
                    <Dialog.Description>
                        {viewContext?.message}
                    </Dialog.Description>
                )}
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant={ButtonVariant.SECONDARY} onClick={handleCancel}>
                    {viewContext?.cancelText || "Cancel"}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={handleSubmit}>
                    {viewContext?.confirmText || "Confirm"}
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
