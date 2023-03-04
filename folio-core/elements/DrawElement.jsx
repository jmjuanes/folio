import React from "react";
import {COLORS} from "../constants.js";
import {getPointsCenter} from "../math.js";

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
    const width = Math.abs(props.x2 - props.x1);
    const height = Math.abs(props.y2 - props.y1);
    const points = props.points || [];
    const strokeWidth = props.strokeWidth ?? 0;
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
            <g transform={`scale(${width/props.drawWidth} ${height/props.drawHeight})`}>
                <path
                    data-element={props.id}
                    d={path}
                    fill="none"
                    stroke={props.strokeColor ?? COLORS.BLACK}
                    strokeWidth={strokeWidth}
                    strokeOpacity={props.strokeOpacity}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    onPointerDown={props.onPointerDown}
                />
            </g>
            <rect
                data-element={props.id}
                x="0"
                y="0"
                width={Math.abs(props.x2 - props.x1)}
                height={Math.abs(props.y2 - props.y1)}
                fill="transparent"
                stroke="none"
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};
