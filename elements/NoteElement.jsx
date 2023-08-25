import React from "react";
import {FIELDS, NONE, TRANSPARENT} from "../constants.js";
import {NOTE_SHADOW_OFFSET} from "../constants.js";

export const NoteElement = props => {
    const x = Math.min(props.x1, props.x2);
    const y = Math.min(props.y1, props.y2);
    const width = Math.abs(props.x2 - props.x1);
    const height = Math.abs(props.y2 - props.y1);
    const opacity = props.creating ? "0.7" : "1.0";
    return (
        <g transform={`translate(${x},${y})`} opacity={opacity}>
            <rect
                data-element={props.id}
                x="0"
                y="0"
                width={Math.max(1, width)}
                height={Math.max(1, height)}
                rx="0"
                fill={props[FIELDS.NOTE_COLOR]}
                stroke={NONE}
                style={{
                    boxShadow: "3px 5px 2px rgb(0,0,0,0.4)",
                    // filter: "drop-shadow(0 0.25rem 1rem -0.125rem rgba(0, 0, 0, 0.15))",
                }}
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
            <rect
                x="0"
                y="0"
                width={Math.max(1, width) + NOTE_SHADOW_OFFSET}
                height={Math.max(1, height) + NOTE_SHADOW_OFFSET}
                fill={TRANSPARENT}
                STROKE={NONE}
            />
        </g>
    );
};
