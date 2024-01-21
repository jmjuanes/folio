import React from "react";
import {
    FIELDS,
    NONE,
    NOTE_MIN_HEIGHT,
    NOTE_MIN_WIDTH,
    NOTE_PADDING,
    NOTE_PLACEHOLDER,
    NOTE_TEXT_ALIGN,
    NOTE_TEXT_COLOR,
    NOTE_TEXT_FONT,
    NOTE_TEXT_SIZE,
} from "@lib/constants.js";
import {measureText} from "@lib/utils/math.js";
import {EditableText} from "../shared/editable-text.jsx";

export const NoteElement = props => {
    const x = props.creating ? props.x1 - NOTE_MIN_WIDTH / 2 : Math.min(props.x1, props.x2);
    const y = props.creating ? props.y1 - NOTE_MIN_HEIGHT / 2 : Math.min(props.y1, props.y2);
    const width  = props.creating ? NOTE_MIN_WIDTH : Math.abs(props.x2 - props.x1);
    const height = props.creating ? NOTE_MIN_HEIGHT : Math.abs(props.y2 - props.y1);
    const opacity = props.creating ? "0.7" : "1.0";

    return (
        <g transform={`translate(${x},${y})`} opacity={opacity}>
            <rect
                x="0"
                y="0"
                width={Math.max(1, width)}
                height={Math.max(1, height)}
                rx="0"
                fill={props[FIELDS.NOTE_COLOR]}
                stroke={NONE}
                style={{
                    WebkitFilter: "drop-shadow(rgba(0, 0, 0, 0.4) 6px 6px 10px)",
                    filter: "drop-shadow(rgba(0, 0, 0, 0.4) 6px 6px 10px)",
                }}
            />
            {!props.creating && (
                <EditableText
                    editing={props.editing}
                    placeholder={NOTE_PLACEHOLDER}
                    autofocus={true}
                    x={NOTE_PADDING}
                    y={NOTE_PADDING}
                    width={width - 2 * NOTE_PADDING}
                    height={height - 2 * NOTE_PADDING}
                    text={props[FIELDS.NOTE_TEXT] || ""}
                    textColor={NOTE_TEXT_COLOR}
                    textFont={NOTE_TEXT_FONT}
                    textAlign={NOTE_TEXT_ALIGN}
                    textSize={NOTE_TEXT_SIZE}
                    onChange={event => {
                        const text = event.target.value || "";
                        const textHeight = measureText(text || " ", NOTE_TEXT_SIZE, NOTE_TEXT_FONT, (NOTE_MIN_WIDTH - 2 * NOTE_PADDING) + "px")[1];
                        const keys = [FIELDS.NOTE_TEXT, "y2"];
                        const values = [text, props.y1 + Math.max(NOTE_MIN_HEIGHT, textHeight + 2 * NOTE_PADDING)];
                        return props.onChange?.(keys, values);
                    }}
                />
            )}
            {!props.creating && !props.editing && (
                <rect
                    data-element={props.id}
                    x="0"
                    y="0"
                    width={Math.max(1, width)}
                    height={Math.max(1, height)}
                    fill="transparent"
                    stroke="none"
                    onPointerDown={props.onPointerDown}
                    onDoubleClick={props.onDoubleClick}
                />
            )}
        </g>
    );
};
