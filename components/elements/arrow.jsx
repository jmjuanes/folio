import React from "react";
import {
    STROKES,
    ARROWHEADS,
    BLACK,
    NONE,
    TRANSPARENT,
    OPACITY_FULL,
    OPACITY_NONE,
} from "../../lib/constants.js";
import {
    getBalancedDash,
    getPointsDistance,
    splitBezierCurve,
    convertBezierPointToTValue,
} from "../../lib/utils/math.js";
import {getCurvePath} from "../../lib/utils/paths.js";
import {Arrowhead} from "./arrow-head.jsx";

// Get the correct point
const getPoint = (x, y, binding) => {
    if (binding && binding?.point) {
        return {x: binding.point[0], y: binding.point[1]};
    }
    return {x, y};
};

export const ArrowElement = props => {
    const x = Math.min(props.x1, props.x2);
    const y = Math.min(props.y1, props.y2);
    const start = getPoint(props.x1, props.y1, props.startBinding);
    const end = getPoint(props.x2, props.y2, props.endBinding);
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
        [strokeWidth, props.strokeStyle, props.x1, props.y1, props.x2, props.y2],
    );
    const arrowPath = React.useMemo(
        () => {
            // No control point provided, just render the line
            if (typeof props.xCenter !== "number") {
                return getCurvePath([start.x - x, start.y - y], [end.x - x, end.y - y]);
            }
            const s = [props.x1 - x, props.y1 - y];
            const e = [props.x2 - x, props.y2 - y];
            const c = [props.xCenter - x, props.yCenter - y];
            // Check for rendering a simple curve without bindings
            if (!props.startBinding && !props.endBinding) {
                return getCurvePath(s, c, e);
            }
            let result = null;
            // 1st case, rendering with only startBinding defined
            if (!props.endBinding) {
                const t = convertBezierPointToTValue(s, c, e, [start.x - x, start.y - y]);
                result = splitBezierCurve(s, c, e, t)[1];
            }
            // 4. Rendering with only endBonding defined
            else if (!props.startBinding) {
                const t = convertBezierPointToTValue(s, c, e, [end.x - x, end.y - y]);
                result = splitBezierCurve(s, c, e, t)[0];
            }
            // 5. Both startBinding and endBinding defined
            else {
                const t1 = convertBezierPointToTValue(s, c, e, [start.x - x, start.y - y]);
                const t2 = convertBezierPointToTValue(s, c, e, [end.x - x, end.y - y]);
                result = splitBezierCurve(s, c, e, t1, t2)[1];
            }
            // Render curve
            return getCurvePath(result[0], result[1], result[2]);
        },
        [start.x, start.y, props.xCenter, props.yCenter, end.x, end.y, !!props.startBinding, !!props.endBinding],
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
                    x={start.x - x}
                    y={start.y - y}
                    x2={(props.xCenter ?? end.x) - x}
                    y2={(props.yCenter ?? end.y) - y}
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
                    x={end.x - x}
                    y={end.y - y}
                    x2={(props.xCenter ?? start.x) - x}
                    y2={(props.yCenter ?? start.y) - y}
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
