import React from "react";
import {STROKES, ARROWHEADS, COLORS, TEXTURES, NONE, TRANSPARENT} from "../constants.js";
import {getBalancedDash, getPointsDistance} from "../utils/math.js";

const Arrowhead = props => {
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
            fill={TRANSPARENT}
            stroke={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            onPointerDown={props.onPointerDown}
        />
    );
};

export const ArrowElement = props => {
    const x = Math.min(props.x1, props.x2);
    const y = Math.min(props.y1, props.y2);
    const strokeColor = props.strokeColor ?? COLORS.BLACK;
    const strokeWidth = props.strokeWidth ?? 0;
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getPointsDistance([props.x1, props.y1], [props.x2, props.y2]);
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === STROKES.DASHED || strokeStyle === STROKES.DOTTED) {
                return getBalancedDash(length, strokeWidth, strokeStyle);
            }
            return [NONE, NONE];
        },
        [strokeWidth, props.strokeStyle, props.x, props.y, props.x2, props.y2],
    );
    return (
        <g transform={`translate(${x},${y})`} opacity={props.opacity}>
            <g filter={`url(#${TEXTURES.PENCIL})`}>
                <rect
                    x={-strokeWidth}
                    y={-strokeWidth}
                    width={Math.abs(props.x1 - props.x2) + 2 * strokeWidth}
                    height={Math.abs(props.y1 - props.y2) + 2 * strokeWidth}
                    fill={NONE}
                    stroke={NONE}
                />
                <line
                    data-element={props.id}
                    x1={props.x1 - x}
                    y1={props.y1 - y}
                    x2={props.x2 - x}
                    y2={props.y2 - y}
                    fill={NONE}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    onPointerDown={props.onPointerDown}
                />
                {props.startArrowhead !== ARROWHEADS.NONE && (
                    <Arrowhead
                        id={props.id}
                        type={props.startArrowhead}
                        x={props.x1 - x}
                        y={props.y1 - y}
                        x2={props.x2 - x}
                        y2={props.y2 - y}
                        strokeWidth={strokeWidth}
                        strokeColor={strokeColor}
                        onPointerDown={props.onPointerDown}
                    />
                )}
                {props.endArrowhead !== ARROWHEADS.NONE && (
                    <Arrowhead
                        id={props.id}
                        type={props.endArrowhead}
                        x={props.x2 - x}
                        y={props.y2 - y}
                        x2={props.x1 - x}
                        y2={props.y1 - y}
                        strokeWidth={strokeWidth}
                        strokeColor={strokeColor}
                        onPointerDown={props.onPointerDown}
                    />
                )}
            </g>
        </g>
    );
};
