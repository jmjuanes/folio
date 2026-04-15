import React from "react";
import classNames from "classnames";
import { useEditor } from "../contexts/editor.tsx";
import { usePanels } from "../contexts/panels.tsx";
import { Ai as AiComponents } from "./ui/ai.tsx";
import { Dialog } from "./ui/dialog.tsx";

export type AiDialogProps = {
    title: string;
};

export const AiDialog = (props: AiDialogProps): React.JSX.Element => {
    // const { clearSurface } = useSurface();
    const { hidePanel } = usePanels();
    // const generateClassName = classNames({
    //     "absolute left-half p-3 rounded-2xl shadow-md bottom-full mb-3 w-full": true,
    //     "bg-white border-1 border-gray-200 shadow-sm": true,
    //     "flex flex-col gap-2": true,
    // });

    return (
        <Dialog.Content className="relative w-full max-w-lg">
            <Dialog.Header className="relative">
                <div className="flex items-center gap-2">
                    <Dialog.Title className="leading-none">{props.title}</Dialog.Title>
                    <div className="flex rounded-md p-1 opacity-60 border-1 border-gray-200">
                        <span className="text-2xs leading-none">BETA</span>
                    </div>
                </div>
                <Dialog.Close onClick={() => hidePanel("toolbar")} />
            </Dialog.Header>
            <Dialog.Body className="flex flex-col gap-4">
                <AiComponents.Prompt>
                    <AiComponents.PromptInput
                        placeholder="Let's create a..."
                    />
                    <div className="flex items-center justify-between">
                        <div className=""></div>
                        <AiComponents.PromptSubmit
                            className="gap-2 px-3"
                            icon="sparkles"
                            text="Generate"
                        />
                    </div>
                </AiComponents.Prompt>
                <div className="text-2xs opacity-60 text-center">
                    <span>Folio AI can make mistakes. Check important info.</span>
                </div>
            </Dialog.Body>
        </Dialog.Content>
    );
};

export const AiGenerateElements = (): React.JSX.Element => {
    const editor = useEditor();
    return (
        <AiDialog
            title="Generate"
        />
    );
};
