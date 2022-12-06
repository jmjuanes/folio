import React from "react";
import {strokeColors, strokeWidths} from "../../styles.js";
import {getPointsCenter} from "../../utils/index.js";

const getPath = points => {
    let lastPoint = points[0];
    const commands = [
        `M${lastPoint[0]},${lastPoint[1]}`,
    ];
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const center = getPointsCenter(lastPoint, point);
        commands.push(`Q${lastPoint[0]},${lastPoint[1]} ${center[0]},${center[1]}`);
        lastPoint = point;
    }
    commands.push(`L${lastPoint[0]},${lastPoint[1]}`);
    return commands.join(" ");
};

export const DrawElement = props => {
    const points = props.points || [];
    const strokeWidth = strokeWidths[props.strokeWidth];
    const path = React.useMemo(() => getPath(points), [points.length]);
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            // const length = getRectanglePerimeter(width, height);
            // return getBalancedDash(length, strokeWidth, props.strokeStyle);
            return ["none", "none"];
        },
        [strokeWidth, props.strokeStyle],
    );
    return (
        <g transform={`translate(${props.x1},${props.y1})`}>
            <path
                d={path}
                fill="none"
                stroke={strokeColors[props.strokeColor]}
                strokeWidth={strokeWidth}
                strokeOpacity={props.strokeOpacity}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeLinejoin="round"
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};
