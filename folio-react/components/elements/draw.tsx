import React from "react";
import {
    STROKES,
    NONE,
    BLACK,
    TRANSPARENT,
    GRID_SIZE,
    OPACITY_FULL,
    OPACITY_NONE,
} from "../../constants.js";
import {
    getCenter,
    getBalancedDash,
    getPointsDistance,
    convertRadiansToDegrees,
} from "../../utils/math.ts";
import { getElementSize } from "../../lib/elements.js";

import type { Point } from "../../utils/math.ts";

const getPath = (points: Point[]): string => {
    let lastPoint = points[0];
    const commands = [
        `M${lastPoint[0]},${lastPoint[1]}`,
    ];
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const center = getCenter(lastPoint, point);
        commands.push(`Q${lastPoint[0]},${lastPoint[1]} ${center[0]},${center[1]}`);
        lastPoint = point;
    }
    commands.push(`L${lastPoint[0]},${lastPoint[1]}`);
    return commands.join(" ");
};

export type DrawElementProps = {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    rotation?: number;
    points: Point[];
    drawWidth?: number;
    drawHeight?: number;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: string;
    opacity?: number;
    creating?: boolean;
    onPointerDown?: (event: React.PointerEvent<SVGPathElement | SVGRectElement>) => void;
};

export const DrawElement = (props: DrawElementProps): React.JSX.Element => {
    const rotation = convertRadiansToDegrees(props.rotation || 0);
    // const width = Math.abs(props.x2 - props.x1) || 1;
    // const height = Math.abs(props.y2 - props.y1) || 1;
    const [ width, height, x, y ] = getElementSize(props);
    const [ cx, cy ] = getCenter([props.x1, props.y1], [props.x2, props.y2]);
    const transform = props.creating ? `translate(${props.x1},${props.y1})` : `translate(${x},${y}) rotate(${rotation}, ${cx - x}, ${cy - y})`;
    const drawWidth = props.drawWidth || width;
    const drawHeight = props.drawHeight || height;
    const points = props.points || [];
    const strokeWidth = props.strokeWidth ?? 0;
    const path = React.useMemo(() => getPath(points), [points.length, props.creating]);
    const strokeOpacity = props.strokeStyle === STROKES.NONE ? OPACITY_NONE : OPACITY_FULL;
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === STROKES.DASHED || strokeStyle === STROKES.DOTTED) {
                const length = getPointsDistance(...points);
                return getBalancedDash(length, strokeWidth, strokeStyle);
            }
            return [NONE, NONE];
        },
        [points.length, strokeWidth, props.strokeStyle],
    );
    return (
        <g transform={transform} opacity={props.opacity}>
            <g transform={`scale(${width/drawWidth} ${height/drawHeight})`}>
                <rect
                    x={-GRID_SIZE / 2}
                    y={-GRID_SIZE / 2}
                    width={Math.abs(props.x2 - props.x1) + GRID_SIZE}
                    height={Math.abs(props.y2 - props.y1) + GRID_SIZE}
                    fill={NONE}
                    stroke={NONE}
                />
                <path
                    data-element={props.id}
                    d={path}
                    fill={NONE}
                    stroke={props.strokeColor ?? BLACK}
                    strokeWidth={strokeWidth}
                    strokeOpacity={strokeOpacity}
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
                fill={TRANSPARENT}
                stroke={NONE}
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};
