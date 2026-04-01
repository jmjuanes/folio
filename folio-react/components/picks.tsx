import React from "react";
import classNames from "classnames";
import { TOOLS } from "../constants.js";
import { Form } from "./form/index.jsx";
import { useEditor } from "../contexts/editor.tsx";
import { useTools } from "../contexts/tools.tsx";
import { ToolState } from "../lib/tool.ts";
import type { ToolItem } from "../contexts/tools.tsx";
import type { ElementTool } from "../tools/element.ts";

export const Picks = (): React.JSX.Element | null => {
    const editor = useEditor();
    const { getToolById } = useTools();
    const picksClassName = classNames({
        "absolute left-half p-1 rounded-lg shadow-md bottom-full mb-3": true,
        "bg-white border-1 border-gray-200 shadow-sm": true,
    });
    // get the active tool configuration
    const activeTool = editor.getCurrentTool() as ToolState | null;
    const activeElementTye = activeTool?.id === TOOLS.ELEMENT ? (activeTool as ElementTool).getElementType?.() : null;
    const toolConfig = React.useMemo<ToolItem | null>(() => {
        if (activeElementTye) {
            return getToolById(activeElementTye) || null;
        }
        return null;
    }, [activeTool, activeElementTye, getToolById]);

    // check if the tool configuration is defined and has picks
    if (!toolConfig || !toolConfig?.picks) {
        return null;
    }

    return (
        <div className={picksClassName} style={{ transform: "translateX(-50%)" }}>
            <Form
                className="flex flex-row gap-2"
                data={editor.getDefaults()}
                items={toolConfig.picks}
                separator={<div className="w-px h-6 bg-gray-200" />}
                onChange={(field: string, value: any) => {
                    editor.setDefaultValue(field, value);
                    if (typeof toolConfig.onPickChange === "function") {
                        toolConfig.onPickChange(editor.getDefaults(), field, value);
                    }
                    editor.update();
                }}
            />
        </div>
    );
};
