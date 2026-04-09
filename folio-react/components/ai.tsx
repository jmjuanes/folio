import React from "react";
import classNames from "classnames";
import { renderIcon } from "@josemi-icons/react";
import { useEditor } from "../contexts/editor.tsx";
import { useSurface } from "../contexts/surface.tsx";
import { Ai as AiComponents } from "./ui/ai.tsx";
import { Centered } from "./ui/centered.tsx";
import { Dialog } from "./ui/dialog.tsx";
import { Overlay, OverlayVariant } from "./ui/overlay.tsx";

export type AiDialogProps = {
    title: string;
};

export const AiDialog = (props: AiDialogProps): React.JSX.Element => {
    const { clearSurface } = useSurface();
    // const generateClassName = classNames({
    //     "absolute left-half p-3 rounded-2xl shadow-md bottom-full mb-3 w-full": true,
    //     "bg-white border-1 border-gray-200 shadow-sm": true,
    //     "flex flex-col gap-2": true,
    // });

    return (
        <React.Fragment>
            <Overlay variant={OverlayVariant.WHITE} className="z-50" />
            <Centered className="fixed h-full w-full z-50">
                <Dialog.Content className="relative w-full max-w-lg">
                    <Dialog.Header className="relative">
                        <div className="flex items-center gap-2">
                            <Dialog.Title className="leading-none">{props.title}</Dialog.Title>
                            <div className="flex rounded-md p-1 opacity-60 border-1 border-gray-200">
                                <span className="text-2xs leading-none">BETA</span>
                            </div>
                        </div>
                        <Dialog.Close onClick={clearSurface} />
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
            </Centered>
        </React.Fragment>
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
