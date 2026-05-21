import { useCallback } from "react";
import { useAlure as useSurface } from "alure";
import { Button, ButtonVariant } from "../components/ui/button.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Form } from "../components/form/index.jsx";
import { useDialog } from "./use-dialog.tsx";
import { useFormData } from "./use-form-data.js";
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
    const { close, getContext } = useSurface();
    const context = getContext();
    const [data, setData] = useFormData(context?.initialData || {});

    const handleSubmit = useCallback(() => {
        if (typeof context?.callback === "function") {
            context.callback(data);
        }
        close();
    }, [data, context?.callback, close]);

    return (
        <Dialog.Content className="w-full max-w-md relative">
            {context?.title && (
                <Dialog.Header>
                    <Dialog.Title>{context?.title}</Dialog.Title>
                    <Dialog.Close onClick={() => close()} />
                </Dialog.Header>
            )}
            <Dialog.Body>
                <Form
                    className="flex flex-col gap-2"
                    data={data}
                    items={context?.items}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant={ButtonVariant.SECONDARY} onClick={() => close()}>
                    {context?.cancelText || "Cancel"}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={() => handleSubmit()}>
                    {context?.confirmText || "Confirm"}
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    );
};

// @description use prompt hook
export const usePrompt = (): Prompt => {
    const { showDialog } = useDialog();

    return useCallback((options: PromptOptions) => {
        showDialog(PromptWrapper, options);
    }, [showDialog]);
};
