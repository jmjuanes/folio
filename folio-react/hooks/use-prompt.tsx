import React from "react";
import { Button, ButtonVariant } from "../components/ui/button.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Form } from "../components/form/index.jsx";
import { useDialog } from "./use-dialog.tsx";
import { useFormData } from "./use-form-data.js";
import { useSurfaceSlot, useSurfaceSlotContext } from "../contexts/surface.tsx";

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
const PromptWrapper = (): React.JSX.Element => {
    const { hideSurfaceSlot } = useSurfaceSlot();
    const surfaceSlotContext = useSurfaceSlotContext();
    const [ data, setData ] = useFormData(surfaceSlotContext?.data?.initialData || {});

    const handleSubmit = React.useCallback(() => {
        if (typeof surfaceSlotContext?.data?.callback === "function") {
            surfaceSlotContext.data.callback(data);
        }
        hideSurfaceSlot();
    }, [data, surfaceSlotContext?.data?.callback, hideSurfaceSlot]);

    return (
        <React.Fragment>
            {surfaceSlotContext?.data?.title && (
                <Dialog.Header>
                    <Dialog.Title>{surfaceSlotContext?.data?.title}</Dialog.Title>
                </Dialog.Header>
            )}
            <Dialog.Body>
                <Form
                    className="flex flex-col gap-2"
                    data={data}
                    items={surfaceSlotContext?.data?.items}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant={ButtonVariant.SECONDARY} onClick={() => hideSurfaceSlot()}>
                    {surfaceSlotContext?.data?.cancelText || "Cancel"}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={() => handleSubmit()}>
                    {surfaceSlotContext?.data?.confirmText || "Confirm"}
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};

// @description use prompt hook
export const usePrompt = (): Prompt => {
    const { showDialog } = useDialog();

    return React.useCallback((options: PromptOptions) => {
        showDialog(PromptWrapper, {
            ...options,
            dialogClassName: options.className || "w-full max-w-md",
        });
    }, [showDialog]);
};
