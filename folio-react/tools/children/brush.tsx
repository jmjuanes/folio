import React from "react";
import {
    BRUSH_FILL_COLOR,
    BRUSH_FILL_OPACITY,
    BRUSH_STROKE_COLOR,
    BRUSH_STROKE_WIDTH,
    BRUSH_STROKE_DASH,
} from "../../constants.js";
import { SvgContainer } from "../../components/svg.tsx";
import { useEditor } from "../../contexts/editor.jsx";

export type BrushProps = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
    strokeDash?: number;
};

export const Brush = (props: BrushProps): React.JSX.Element => {
    const editor = useEditor();
    return (
        <SvgContainer>
            <rect
                x={Math.min(props.x1, props.x2)}
                y={Math.min(props.y1, props.y2)}
                width={Math.abs(props.x2 - props.x1)}
                height={Math.abs(props.y2 - props.y1)}
                fill={props.fillColor ?? BRUSH_FILL_COLOR}
                fillOpacity={props.fillOpacity ?? BRUSH_FILL_OPACITY}
                stroke={props.strokeColor ?? BRUSH_STROKE_COLOR}
                strokeWidth={(props.strokeWidth ?? BRUSH_STROKE_WIDTH) / editor.page.zoom}
                strokeDasharray={(props.strokeDash ?? BRUSH_STROKE_DASH) / editor.page.zoom}
            />
        </SvgContainer>
    );
};
