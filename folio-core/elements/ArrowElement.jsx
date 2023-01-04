import React from "react";
import {STROKES, ARROWHEADS} from "../constants.js";
import {getBalancedDash, getPointsDistance} from "../math.js";
import {useStyles} from "../contexts/StylesContext.jsx";

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
            fill="transparent"
            stroke={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeOpacity={props.strokeOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            onPointerDown={props.onPointerDown}
        />
    );
};

export const ArrowElement = props => {
    const styles = useStyles();
    const strokeColor = styles?.strokeColors?.[props.strokeColor];
    const strokeWidth = styles?.strokeWidths?.[props.strokeWidth];
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getPointsDistance([props.x1, props.y1], [props.x2, props.y2]);
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === STROKES.DASHED || strokeStyle === STROKES.DOTTED) {
                return getBalancedDash(length, strokeWidth, strokeStyle);
            }
            return ["none", "none"];
        },
        [strokeWidth, props.strokeStyle, props.x, props.y, props.x2, props.y2],
    );
    return (
        <React.Fragment>
            <line
                data-element={props.id}
                x1={props.x1}
                y1={props.y1}
                x2={props.x2}
                y2={props.y2}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={props.strokeOpacity}
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
                    x={props.x1}
                    y={props.y1}
                    x2={props.x2}
                    y2={props.y2}
                    strokeWidth={strokeWidth}
                    strokeColor={strokeColor}
                    strokeOpacity={props.strokeOpacity}
                    onPointerDown={props.onPointerDown}
                />
            )}
            {props.endArrowhead !== ARROWHEADS.NONE && (
                <Arrowhead
                    id={props.id}
                    type={props.endArrowhead}
                    x={props.x2}
                    y={props.y2}
                    x2={props.x1}
                    y2={props.y1}
                    strokeWidth={strokeWidth}
                    strokeColor={strokeColor}
                    strokeOpacity={props.strokeOpacity}
                    onPointerDown={props.onPointerDown}
                />
            )}
        </React.Fragment>
    );
};