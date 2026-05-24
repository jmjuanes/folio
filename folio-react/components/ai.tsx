import { Fragment, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAlure as useSurface } from "alure";
import { useAi } from "../contexts/ai.tsx";
import { Ai as AiComponents } from "./ui/ai.tsx";
import { Dialog } from "./ui/dialog.tsx";
import { Overlay, OverlayVariant } from "./ui/overlay.tsx";
import type { JSX } from "react";

export type AiDialogProps = {
    title: string;
    placeholder: string;
    loading?: boolean;
    isQuotaLoading?: boolean;
    isQuotaExceeded?: boolean;
    onSubmit: (prompt: string) => Promise<any>;
    processResponse: (response: any) => void;
};

export const AiDialog = (props: AiDialogProps): JSX.Element => {
    const { quotas } = useAi();
    const { close } = useSurface();
    const [prompt, setPrompt] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const cancelled = useRef<boolean>(false);

    // on unmount, mark as cancelled so we do not call close() on a dead component
    useEffect(() => {
        return () => { cancelled.current = true; };
    }, []);

    const handleSubmit = useCallback(async () => {
        setError(null);
        try {
            const response = await props.onSubmit(prompt);
            if (!cancelled.current) {
                props.processResponse(response);
                close();
            }
        } catch (e: any) {
            if (!cancelled.current) {
                setError(
                    e?.message === "quota_exceeded"
                        ? "You have reached your request limit."
                        : "Something went wrong. Please try again.",
                );
            }
        }
    }, [props.onSubmit, props.processResponse, close, setError]);

    // derive the footer message to show below the form
    const footerMessage = useMemo(() => {
        if (props.isQuotaExceeded) {
            return "You have reached your request limit.";
        }
        if (error) {
            return error;
        }
        return "Folio AI can make mistakes. Check important info.";
    }, [props.isQuotaExceeded, error]);

    const footerIsError = props.isQuotaExceeded || !!error;
    const isDisabled = props.loading || props.isQuotaLoading || props.isQuotaExceeded || !prompt;

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
                        placeholder={props.placeholder}
                        disabled={props.isQuotaExceeded || props.isQuotaLoading}
                        onChange={(value: string) => setPrompt(value)}
                    />
                    <div className="flex items-center justify-between">
                        <div className="" />
                        <AiComponents.PromptSubmit
                            className="gap-2 px-3"
                            icon={props.loading ? "loader" : "sparkles"}
                            text={props.loading ? "Generating..." : "Generate"}
                            disabled={isDisabled}
                            onClick={handleSubmit}
                        />
                    </div>
                </AiComponents.Prompt>
                {!!quotas && quotas?.requestsLimit && (
                    <AiComponents.Quotas
                        requestsLimit={quotas?.requestsLimit}
                        requestsUsed={quotas.requestsUsed}
                    />
                )}
                <div className={`text-2xs text-center ${footerIsError ? "text-red-500" : "opacity-60"}`}>
                    <span>{footerMessage}</span>
                </div>
            </div>
        </Dialog.Content>
    );
};

export const AiGenerateElements = (): JSX.Element => {
    const { close } = useSurface();
    const { loading, isQuotaExceeded, isQuotaLoading, generateElements } = useAi();
    return (
        <Fragment>
            <Overlay variant={OverlayVariant.WHITE} className="z-50" onClick={() => close()} />
            <div
                className="absolute z-50 left-half top-0 mt-4 w-full max-w-lg pointer-events-auto"
                style={{ transform: "translateX(-50%)" }}
            >
                <AiDialog
                    title="Generate Elements with AI"
                    placeholder="Let's create a ..."
                    loading={loading}
                    isQuotaLoading={isQuotaLoading}
                    isQuotaExceeded={isQuotaExceeded}
                    onSubmit={(prompt: string) => {
                        return generateElements(prompt);
                    }}
                    processResponse={(elements) => {
                        console.log("Generated elements", elements);
                    }}
                />
            </div>
        </Fragment>
    );
};
