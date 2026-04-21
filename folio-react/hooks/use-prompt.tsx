import { Fragment, useCallback } from "react";
import { Button, ButtonVariant } from "../components/ui/button.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Form } from "../components/form/index.jsx";
import { useDialog } from "./use-dialog.tsx";
import { useFormData } from "./use-form-data.js";
import { useView, useViewContext } from "../contexts/workbench.tsx";
import type { JSX } from "react";

export type PromptOptions = {
    className?: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    initialData?: any;
    items: any;
    callback: (data: any) => void;
};

export type Prompt = (options: PromptOptions) => void;

// @description internal prompt component
const PromptWrapper = (): JSX.Element => {
    const view = useView();
    const viewContext = useViewContext();
    const [data, setData] = useFormData(viewContext?.initialData || {});

    const handleSubmit = useCallback(() => {
        if (typeof viewContext?.callback === "function") {
            viewContext.callback(data);
        }
        view.close();
    }, [data, viewContext?.callback, view?.close]);

    return (
        <Fragment>
            {viewContext?.title && (
                <Dialog.Header>
                    <Dialog.Title>{viewContext?.title}</Dialog.Title>
                </Dialog.Header>
            )}
            <Dialog.Body>
                <Form
                    className="flex flex-col gap-2"
                    data={data}
                    items={viewContext?.items}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant={ButtonVariant.SECONDARY} onClick={() => view.close()}>
                    {viewContext?.cancelText || "Cancel"}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={() => handleSubmit()}>
                    {viewContext?.confirmText || "Confirm"}
                </Button>
            </Dialog.Footer>
        </Fragment>
    );
};

// @description use prompt hook
export const usePrompt = (): Prompt => {
    const { showDialog } = useDialog();

    return useCallback((options: PromptOptions) => {
        showDialog(PromptWrapper, {
            ...options,
            dialogClassName: options.className || "w-full max-w-md",
        });
    }, [showDialog]);
};
