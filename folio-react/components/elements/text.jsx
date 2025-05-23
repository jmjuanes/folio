import React from "react";
import {
    BLACK,
    FONT_FACES,
    GRID_SIZE,
    TEXT_ALIGNS,
    TEXT_VERTICAL_ALIGNS,
} from "../../constants.js";
import {measureText} from "../../utils/math.js";
import {EditableText} from "./editable-text.jsx";

const getTextVerticalPosition = (align, height, textHeight) => {
    // align text to top
    if (align === TEXT_VERTICAL_ALIGNS.TOP) {
        return (-1) * height / 2;
    }
    // align text to bottom
    else if (align === TEXT_VERTICAL_ALIGNS.BOTTOM) {
        return (height / 2) - textHeight;
    }
    // Other case, align to center
    else {
        return (-1) * textHeight / 2;
    }
};

export const TextElement = props => {
    const padding = props.padding ?? 0;
    const x = (props.x1 + props.x2) / 2;
    const y = (props.y1 + props.y2) / 2;
    const width = Math.abs(props.x2 - props.x1) - (2 * padding);
    const height = Math.abs(props.y2 - props.y1) - (2 * padding);
    const textSize = props.textSize ?? 0;
    const textFont = props.textFont ?? FONT_FACES.SANS;
    const textColor = props.textColor ?? BLACK;

    return (
        <g transform={`translate(${x} ${y})`}>
            {!props.embedded && (!!props.creating || props.editing) && (
                <rect
                    x={(-1) * width / 2}
                    y={(-1) * height / 2}
                    width={width}
                    height={height}
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
                x={(-1) * width / 2}
                y={getTextVerticalPosition(props.textVerticalAlign, height, props.textHeight)}
                width={width}
                height={props.textHeight}
                text={props.text || ""}
                textFont={textFont}
                textSize={textSize}
                textColor={textColor}
                textAlign={props.textAlign || TEXT_ALIGNS.CENTER}
                opacity={props.opacity}
                onChange={event => {
                    if (typeof props.onChange === "function") {
                        const text = event.target.value || "";
                        const [textWidth, textHeight] = measureText(text || " ", textSize, textFont, width + "px");
                        const keys = ["text", "textWidth", "textHeight"];
                        const values = [text, textWidth, textHeight];
                        if (!props.embedded) {
                            keys.push("y2");
                            values.push(props.y1 + Math.ceil(textHeight / GRID_SIZE) * GRID_SIZE);
                        }
                        return props.onChange?.(keys, values);
                    }
                }}
                onBlur={props.onBlur}
            />
            {!props.editing && (
                <rect
                    data-element={props.id}
                    x={(-1) * width / 2}
                    y={(-1) * height / 2}
                    width={Math.max(width, 0)}
                    height={Math.max(height, 0)}
                    fill="transparent"
                    stroke="none"
                    onPointerDown={props.onPointerDown}
                    onDoubleClick={props.onDoubleClick}
                />
            )}
        </g>
    );
};

TextElement.defaultProps = {
    text: "",
    padding: 0,
    embedded: false,
    verticalAlign: "center",
    onChange: null,
    onPointerDown: null,
    onDoubleClick: null,
};
