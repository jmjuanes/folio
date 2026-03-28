import React from "react";
import { TOOLS } from "../constants.js";
import { useEditor } from "../contexts/editor.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import type { ToolState } from "../lib/tool.ts";

export const Overlays = (): React.JSX.Element => {
    const editor = useEditor();
    const tool = editor.getCurrentTool() as ToolState | null;
    const {
        Bounds,
        Brush,
        Dimensions,
        Handlers,
    } = useEditorComponents();

    return (
        <React.Fragment>
            {!!Bounds && tool?.id === TOOLS.SELECT && (
                <Bounds />
            )}
            {!!Handlers && tool?.id === TOOLS.SELECT && (
                <Handlers />
            )}
            {!!Brush && tool?.id === TOOLS.SELECT && tool?.activeStateId === "brushing" && (
                <Brush />
            )}
            {!!Dimensions && editor?.appState?.objectDimensions && (
                <Dimensions />
            )}
        </React.Fragment>
    );
};
