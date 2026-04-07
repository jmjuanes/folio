import React from "react";
import classNames from "classnames";
import { Ai as AiComponents } from "./ui/ai.tsx";


export const Generate = (): React.JSX.Element => {
    const generateClassName = classNames({
        "absolute left-half p-3 rounded-2xl shadow-md bottom-full mb-3 w-full": true,
        "bg-white border-1 border-gray-200 shadow-sm": true,
        "flex flex-col gap-2": true,
    });

    return (
        <div className={generateClassName} style={{ transform: "translateX(-50%)" }}>
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
        </div>
    );
};
