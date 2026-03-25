import React from "react";
import {
    BRUSH_FILL_COLOR,
    BRUSH_FILL_OPACITY,
    BRUSH_STROKE_COLOR,
    BRUSH_STROKE_WIDTH,
    BRUSH_STROKE_DASH,
} from "../constants.js";
import { SvgContainer } from "./svg.tsx";
import { useEditor } from "../contexts/editor.tsx";
import type { ToolState } from "../lib/tool.ts";
import { SelectBrushingState } from "../tools/children/select-brushing.ts";
import type { SelectionArea } from "../tools/children/select-brushing.ts";

export type BrushProps = {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
    strokeDash?: number;
};

export const Brush = (props: BrushProps): React.JSX.Element => {
    const editor = useEditor();
    const tool = editor.getCurrentTool() as ToolState | null;
    const selection = (tool?.getActiveState() as SelectBrushingState | null)?.selection || null as SelectionArea | null;

    return (
        <SvgContainer>
            {selection && (
                <rect
                    x={Math.min(selection.x1, selection.x2)}
                    y={Math.min(selection.y1, selection.y2)}
                    width={Math.abs(selection.x2 - selection.x1)}
                    height={Math.abs(selection.y2 - selection.y1)}
                    fill={props.fillColor ?? BRUSH_FILL_COLOR}
                    fillOpacity={props.fillOpacity ?? BRUSH_FILL_OPACITY}
                    stroke={props.strokeColor ?? BRUSH_STROKE_COLOR}
                    strokeWidth={(props.strokeWidth ?? BRUSH_STROKE_WIDTH) / editor.page.zoom}
                    strokeDasharray={(props.strokeDash ?? BRUSH_STROKE_DASH) / editor.page.zoom}
                />
            )}
        </SvgContainer>
    );
};
