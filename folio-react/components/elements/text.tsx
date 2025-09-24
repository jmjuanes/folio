import React from "react";
import {
    BLACK,
    FONT_FACES,
    TEXT_ALIGNS,
    TEXT_VERTICAL_ALIGNS,
} from "../../constants.js";
import { convertRadiansToDegrees, measureText } from "../../utils/math.ts";
import { EditableText } from "./editable-text.jsx";
import { getElementSize } from "../../lib/elements.js";

const getTextVerticalPosition = (align: string, height: number, textHeight: number): number => {
    // align text to top
    if (align === TEXT_VERTICAL_ALIGNS.TOP) {
        return 0;
        // return (-1) * height / 2;
    }
    // align text to bottom
    else if (align === TEXT_VERTICAL_ALIGNS.BOTTOM) {
        // return (height / 2) - textHeight;
        return height - textHeight;
    }
    // Other case, align to center
    // return (-1) * textHeight / 2;
    return (height / 2) - (textHeight / 2);
};

export type TextElementProps = {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    rotation?: number;
    text?: string;
    textSize?: number;
    textFont?: string;
    textColor?: string;
    textAlign?: string;
    textVerticalAlign?: string;
    textHeight?: number;
    padding?: number;
    opacity?: number;
    embedded?: boolean;
    creating?: boolean;
    editing?: boolean;
    onChange?: (keys: string[], values: any[]) => void;
    onPointerDown?: (event: React.PointerEvent<SVGRectElement>) => void;
    onDoubleClick?: (event: React.MouseEvent<SVGRectElement, MouseEvent>) => void;
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
};

export const TextElement = (props: TextElementProps): React.JSX.Element => {
    const padding = props.padding ?? 0;
    const cx = (props.x1 + props.x2) / 2;
    const cy = (props.y1 + props.y2) / 2;
    const [ width, height, x, y ] = getElementSize(props);
    const rotation = convertRadiansToDegrees(props.rotation || 0);
    // const x = (props.x1 + props.x2) / 2;
    // const y = (props.y1 + props.y2) / 2;
    // const width = Math.abs(props.x2 - props.x1) - (2 * padding);
    // const height = Math.abs(props.y2 - props.y1) - (2 * padding);
    const textSize = props.textSize ?? 0;
    const textFont = props.textFont ?? FONT_FACES.SANS;
    const textColor = props.textColor ?? BLACK;

    return (
        <g transform={`translate(${x},${y}) rotate(${rotation}, ${cx - x}, ${cy - y})`}>
            {!props.embedded && (!!props.creating || props.editing) && (
                <rect
                    x={padding}
                    y={padding}
                    width={width - 2 * padding}
                    height={height - 2 * padding}
                    fill={props.editing ? "#0d6efd" : "transparent"}
                    fillOpacity="0.1"
                    stroke={props.editing ? "none" : "#0d6efd"}
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    rx={props.editing ? "8" : "0"}
                />
            )}
            <EditableText
                editing={props.editing}
                autofocus={true}
                x={padding}
                y={padding + getTextVerticalPosition(props.textVerticalAlign || "center", height - 2 * padding, props.textHeight || 0)}
                width={width - 2 * padding}
                height={props.textHeight}
                text={props.text || ""}
                textFont={textFont}
                textSize={textSize}
                textColor={textColor}
                textAlign={props.textAlign || TEXT_ALIGNS.CENTER}
                opacity={props.opacity}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    if (typeof props.onChange === "function") {
                        const text = event.target.value || "";
                        const [textWidth, textHeight] = measureText(text || " ", textSize, textFont, width + "px");
                        const keys = ["text", "textWidth", "textHeight"];
                        const values = [text, textWidth, textHeight];
                        return props.onChange?.(keys, values);
                    }
                }}
                onBlur={props.onBlur}
            />
            {!props.editing && (
                <rect
                    data-element={props.id}
                    x={padding}
                    y={padding}
                    width={Math.max(width - 2 * padding, 0)}
                    height={Math.max(height - 2 * padding, 0)}
                    fill="transparent"
                    stroke="none"
                    onPointerDown={props.onPointerDown}
                    onDoubleClick={props.onDoubleClick}
                />
            )}
        </g>
    );
};
