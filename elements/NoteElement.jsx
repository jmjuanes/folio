import React from "react";
import {FIELDS, NONE, NOTE_MIN_HEIGHT, NOTE_MIN_WIDTH} from "../constants.js";

export const NoteElement = props => {
    const x = props.creating ? props.x1 - NOTE_MIN_WIDTH / 2 : Math.min(props.x1, props.x2);
    const y = props.creating ? props.y1 - NOTE_MIN_HEIGHT / 2 : Math.min(props.y1, props.y2);
    const width  = props.creating ? NOTE_MIN_WIDTH : Math.abs(props.x2 - props.x1);
    const height = props.creating ? NOTE_MIN_HEIGHT : Math.abs(props.y2 - props.y1);
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
                    WebkitFilter: "drop-shadow(rgba(0, 0, 0, 0.4) 6px 6px 10px)",
                    filter: "drop-shadow(rgba(0, 0, 0, 0.4) 6px 6px 10px)",
                }}
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
