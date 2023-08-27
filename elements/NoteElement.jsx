import React from "react";
import {FIELDS, NONE} from "../constants.js";
import {NOTE_TEXT_COLOR, NOTE_TEXT_FONT} from "../constants.js";

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
                    webkitFilter: "drop-shadow(rgba(0, 0, 0, 0.4) 6px 6px 10px)",
                    filter: "drop-shadow(rgba(0, 0, 0, 0.4) 6px 6px 10px)",
                }}
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
