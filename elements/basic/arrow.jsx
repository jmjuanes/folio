import React from "react";
import {
    STROKES,
    ARROWHEADS,
    BLACK,
    NONE,
    TRANSPARENT,
    OPACITY_FULL,
    OPACITY_NONE,
} from "@lib/constants.js";
import {Arrowhead} from "../shared/arrow-head.jsx";
import {getBalancedDash, getPointsDistance} from "@lib/utils/math.js";
import {getCurvePath} from "@lib/utils/paths.js";

export const ArrowElement = props => {
    const x = Math.min(props.x1, props.x2);
    const y = Math.min(props.y1, props.y2);
    const strokeColor = props.strokeColor ?? BLACK;
    const strokeWidth = props.strokeWidth ?? 0;
    const strokeOpacity = props.strokeStyle === STROKES.NONE ? OPACITY_NONE : OPACITY_FULL;
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === STROKES.DASHED || strokeStyle === STROKES.DOTTED) {
                const length = getPointsDistance([props.x1, props.y1], [props.x2, props.y2]);
                return getBalancedDash(length, strokeWidth, strokeStyle);
            }
            return [NONE, NONE];
        },
        [strokeWidth, props.strokeStyle, props.x, props.y, props.x2, props.y2],
    );
    const arrowPath = React.useMemo(
        () => {
            const points = [
                [props.x1 - x, props.y1 - y],
                [props.x2 - x, props.y2 - y],
            ];
            let controlPoint = null;
            if (typeof props.xCenter === "number") {
                controlPoint = [props.xCenter - x, props.yCenter - y];
            }
            return getCurvePath(points, controlPoint);
        },
        [props.x1, props.y1, props.xCenter, props.yCenter, props.x2, props.y2],
    );
    return (
        <g transform={`translate(${x},${y})`} opacity={props.opacity}>
            <rect
                x={-strokeWidth}
                y={-strokeWidth}
                width={Math.abs(props.x1 - props.x2) + 2 * strokeWidth}
                height={Math.abs(props.y1 - props.y2) + 2 * strokeWidth}
                fill={NONE}
                stroke={NONE}
            />
            <path
                data-element={props.id}
                d={arrowPath}
                fill={NONE}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={strokeOpacity}
                onPointerDown={props.onPointerDown}
            />
            {props.startArrowhead !== ARROWHEADS.NONE && (
                <Arrowhead
                    id={props.id}
                    type={props.startArrowhead}
                    x={props.x1 - x}
                    y={props.y1 - y}
                    x2={(props.xCenter ?? props.x2) - x}
                    y2={(props.yCenter ?? props.y2) - y}
                    strokeWidth={strokeWidth}
                    strokeColor={strokeColor}
                    strokeOpacity={strokeOpacity}
                    onPointerDown={props.onPointerDown}
                />
            )}
            {props.endArrowhead !== ARROWHEADS.NONE && (
                <Arrowhead
                    id={props.id}
                    type={props.endArrowhead}
                    x={props.x2 - x}
                    y={props.y2 - y}
                    x2={(props.xCenter ?? props.x1) - x}
                    y2={(props.yCenter ?? props.y1) - y}
                    strokeWidth={strokeWidth}
                    strokeColor={strokeColor}
                    strokeOpacity={strokeOpacity}
                    onPointerDown={props.onPointerDown}
                />
            )}
            <path 
                data-element={props.id}
                d={arrowPath}
                fill={TRANSPARENT}
                stroke={TRANSPARENT}
                strokeWidth={Math.max(strokeWidth, 2) * 4}
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};
