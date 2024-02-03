import React from "react";
import {ARROWHEADS, NONE} from "@lib/constants.js";

export const Arrowhead = props => {
    const size = props.strokeWidth * 2 + 4;
    const angle = Math.atan2(props.y - props.y2, props.x - props.x2);
    const commands = [];

    if (props.type === ARROWHEADS.ARROW || props.type === ARROWHEADS.TRIANGLE) {
        const angle2 = Math.PI / 6;
        const hip = size * 4 / 3;
        commands.push(`M${props.x - hip * Math.cos(angle - angle2)},${props.y + hip * Math.sin(angle2 - angle)}`);
        commands.push(`L${props.x},${props.y}`);
        commands.push(`L${props.x - hip * Math.cos(angle2 + angle)},${props.y - hip * Math.sin(angle2 + angle)}`);
        if (props.type === ARROWHEADS.TRIANGLE) {
            commands.push("Z");
        }
    }
    else if (props.type === ARROWHEADS.SQUARE) {
        const angle2 = Math.atan(0.5); // Second angle for the rectangle
        const hsize = size / 2; // Half of the size
        const hip = Math.sqrt(size * size + hsize * hsize);
        commands.push(`M${props.x},${props.y}`);
        commands.push(`L${props.x - hsize * Math.sin(angle)},${props.y + hsize * Math.cos(angle)}`);
        commands.push(`L${props.x - hip * Math.cos(angle - angle2)},${props.y + hip * Math.sin(angle2 - angle)}`);
        commands.push(`L${props.x - hip * Math.cos(angle + angle2)},${props.y - hip * Math.sin(angle2 + angle)}`);
        commands.push(`L${props.x + hsize * Math.sin(angle)},${props.y - hsize * Math.cos(angle)}`);
        commands.push("Z");
    }
    else if (props.type === ARROWHEADS.SEGMENT) {
        const hsize = size / 2; // Half of the size
        commands.push(`M${props.x - hsize * Math.sin(angle)},${props.y + hsize * Math.cos(angle)}`);
        commands.push(`L${props.x + hsize * Math.sin(angle)},${props.y - hsize * Math.cos(angle)}`);
    }
    else if (props.type === ARROWHEADS.CIRCLE) {
        const hsize = size / 2; // Half of the size
        const x2 = props.x - size * Math.cos(angle);
        const y2 = props.y - size * Math.sin(angle);
        commands.push(`M${props.x},${props.y}`);
        commands.push(`A${hsize},${hsize} 0 1 1 ${x2},${y2}`);
        commands.push(`A${hsize},${hsize} 0 1 1 ${props.x},${props.y}`);
    }

    return (
        <path
            data-element={props.id}
            d={commands.join("")}
            fill={NONE}
            stroke={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeOpacity={props.strokeOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            onPointerDown={props.onPointerDown}
        />
    );
};

Arrowhead.defaultProps = {};

