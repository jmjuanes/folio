import React from "react";
import { Dialog } from "../components/ui/dialog.jsx";
import { Form } from "../components/form/index.jsx";
import { useDialog } from "../contexts/dialogs.jsx";
import { useFormData } from "../hooks/use-form-data.js";

export type PromptOptions = {
    className?: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    initialData?: any;
    items: any;
    callback: (data: any) => void;
};

export type PromptProps = {
    initialData?: any;
    items: any;
    title?: string;
    cancelText?: string;
    confirmText?: string;
    onCancel: () => void;
    onConfirm: (data: any) => void;
};

// @description internal prompt component
const PromptWrapper = (props: PromptProps): React.JSX.Element => {
    const [ data, setData ] = useFormData(props.initialData || {});
    return (
        <React.Fragment>
            {props.title && (
                <Dialog.Header>
                    <Dialog.Title>{props.title}</Dialog.Title>
                </Dialog.Header>
            )}
            <Dialog.Body>
                <Form
                    className="flex flex-col gap-2"
                    data={data}
                    items={props.items}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant="secondary" onClick={() => props.onCancel()}>
                    {props.cancelText || "Cancel"}
                </Button>
                <Button variant="primary" onClick={() => props.onConfirm(data)}>
                    {props.confirmText || "Confirm"}
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};

// @description use prompt hook
export const usePrompt = () => {
    const { showDialog, hideDialog } = useDialog();
    return React.useCallback((options: PromptOptions) => {
        showDialog({
            dialogClassName: options.className || "w-full max-w-md",
            component: PromptWrapper,
            props: {
                title: options.title,
                confirmText: options.confirmText,
                cancelText: options.cancelText,
                initialData: options.initialData || {},
                items: options.items,
                onCancel: () => hideDialog(),
                onConfirm: (data: any) => options.callback(data),
            } as PromptProps,
        });
    }, [ showDialog, hideDialog ]);
};
