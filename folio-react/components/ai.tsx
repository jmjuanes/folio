import React from "react";
import classNames from "classnames";
import { useEditor } from "../contexts/editor.tsx";
import { useSurfaceSlot, useSurfaceSlotClearWithEscKey } from "../contexts/surface.tsx";
import { Ai as AiComponents } from "./ui/ai.tsx";
import { Dialog } from "./ui/dialog.tsx";

export type AiDialogProps = {
    title: string;
    onSubmit: (prompt: string) => Promise<void>;
};

export const AiDialog = (props: AiDialogProps): React.JSX.Element => {
    useSurfaceSlotClearWithEscKey();
    const { hideSurfaceSlot } = useSurfaceSlot();
    const [prompt, setPrompt] = React.useState<string>("");
    const shouldCancelRequest = React.useRef<boolean>(false);

    // handle submit
    const handleSubmit = async () => {
        try {
            await props.onSubmit(prompt);
            hideSurfaceSlot();
        }
        catch (error: any) {
            console.error(error);
        }
    };

    // on unmount, cancel the request if is in process
    React.useEffect(() => {
        return () => {
            shouldCancelRequest.current = true;
        };
    }, []);

    return (
        <Dialog.Content className="relative w-full p-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="leading-none font-bold">{props.title}</div>
                <div className="flex rounded-md p-1 opacity-60 border-1 border-gray-200 leading-none">
                    <span className="text-2xs font-medium">BETA</span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <AiComponents.Prompt>
                    <AiComponents.PromptInput
                        placeholder="Let's create a..."
                        onChange={(value: string) => setPrompt(value)}
                    />
                    <div className="flex items-center justify-between">
                        <div className=""></div>
                        <AiComponents.PromptSubmit
                            className="gap-2 px-3"
                            icon="sparkles"
                            text="Generate"
                            disabled={!prompt}
                            onClick={() => handleSubmit()}
                        />
                    </div>
                </AiComponents.Prompt>
                <div className="text-2xs opacity-60 text-center">
                    <span>Folio AI can make mistakes. Check important info.</span>
                </div>
            </div>
        </Dialog.Content>
    );
};

export const AiGenerateElements = (): React.JSX.Element => {
    const editor = useEditor();
    return (
        <div className="absolute z-50 left-half top-0 mt-4 w-full max-w-lg pointer-events-auto" style={{ transform: "translateX(-50%)" }}>
            <AiDialog
                title="Generate Elements with AI"
                onSubmit={(prompt) => {
                    return Promise.resolve();
                }}
            />
        </div>
    );
};
