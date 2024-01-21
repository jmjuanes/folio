import React from "react";
import {
    STROKES,
    SHAPES,
    BLACK,
    NONE,
    TRANSPARENT,
    FILL_STYLES,
    OPACITY_HALF,
    OPACITY_NONE,
    OPACITY_FULL,
    HATCH_ANGLE,
    HATCH_GAP,
} from "@lib/constants.js";
import {
    getBalancedDash,
    getEllipsePerimeter,
    getPointsDistance,
} from "@lib/utils/math.js";
import {
    getPolygonPath,
    getPolygonHatchPath,
    getEllipseHatchPath,
} from "@lib/utils/paths.js";

const HatchFill = props => {
    const lines = React.useMemo(
        () => {
            const center = [props.width / 2, props.height / 2];
            const gap = HATCH_GAP * props.strokeWidth;
            if (props.type === SHAPES.ELLIPSE) {
                return getEllipseHatchPath(props.width, props.height, center, HATCH_ANGLE, gap);
            }
            else {
                return getPolygonHatchPath(props.path, center, HATCH_ANGLE, gap);
            }
        },
        [props.type, props.width, props.height, props.strokeWidth],
    );
    return (
        <React.Fragment>
            {lines.map((line, index) => (
                <path
                    key={index}
                    d={`M${line[0][0]},${line[0][1]}L${line[1][0]},${line[1][1]}`}
                    fill={NONE}
                    stroke={props.strokeColor}
                    strokeWidth={props.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}
        </React.Fragment>
    );
};

const SimpleLine = props => {
    const strokeOpacity = props.strokeStyle === STROKES.NONE ? OPACITY_NONE : OPACITY_FULL;
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const strokeStyle = props.strokeStyle;
            const length = getPointsDistance(
                [props.x1, props.y1],
                [props.x2, props.y2],
            );
            if (strokeStyle === STROKES.DASHED || strokeStyle === STROKES.DOTTED) {
                return getBalancedDash(length, props.strokeWidth, strokeStyle);
            }
            return ["none", "none"];
        },
        [props.strokeWidth, props.strokeStyle, props.x1, props.y1, props.x2, props.y2],
    );
    return (
        <line
            x1={props.x1}
            y1={props.y1}
            x2={props.x2}
            y2={props.y2}
            fill="none"
            stroke={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};

const EllipseShape = props => {
    const rx = props.width / 2;
    const ry = props.height / 2;
    const strokeOpacity = props.strokeStyle === STROKES.NONE ? OPACITY_NONE : OPACITY_FULL;
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getEllipsePerimeter(rx, ry);
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === STROKES.DASHED || strokeStyle === STROKES.DOTTED) {
                return getBalancedDash(length, props.strokeWidth, strokeStyle);
            }
            return ["none", "none"];
        },
        [rx, ry, props.strokeWidth, props.strokeStyle],
    );
    return (
        <React.Fragment>
            {props.fillColor !== TRANSPARENT && props.width > 1 && props.height > 1 && (
                <React.Fragment>
                    {props.fillStyle === FILL_STYLES.HATCH && (
                        <HatchFill
                            type={SHAPES.ELLIPSE}
                            width={props.width}
                            height={props.height}
                            strokeColor={props.fillColor}
                            strokeWidth={props.strokeWidth / 2}
                        />
                    )}
                    {(props.fillStyle === FILL_STYLES.SOLID || props.fillStyle === FILL_STYLES.TRANSPARENT) && (
                        <ellipse
                            cx={rx}
                            cy={ry}
                            rx={rx}
                            ry={ry}
                            fill={props.fillColor}
                            stroke={NONE}
                            opacity={props.fillStyle === FILL_STYLES.TRANSPARENT ? OPACITY_HALF : 1}
                        />
                    )}
                </React.Fragment>
            )}
            <ellipse
                cx={rx}
                cy={ry}
                rx={rx}
                ry={ry}
                fill={NONE}
                stroke={props.strokeColor}
                strokeWidth={props.strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </React.Fragment>
    );
};

const PolygonShape = props => {
    const polygonOpacity = props.fillStyle === FILL_STYLES.TRANSPARENT ? OPACITY_HALF : OPACITY_FULL;
    const polygonPath = React.useMemo(
        () => getPolygonPath(props.type, props.width, props.height),
        [props.type, props.width, props.height],
    );

    return (
        <React.Fragment>
            {props.fillColor !== TRANSPARENT && props.width > 1 && props.height > 1 && (
                <React.Fragment>
                    {props.fillStyle === FILL_STYLES.HATCH && (
                        <HatchFill
                            type={props.type}
                            path={polygonPath}
                            width={props.width}
                            height={props.height}
                            strokeColor={props.fillColor}
                            strokeWidth={props.strokeWidth / 2}
                        />
                    )}
                    {(props.fillStyle === FILL_STYLES.SOLID || props.fillStyle === FILL_STYLES.TRANSPARENT) && (
                        <polygon
                            points={polygonPath.map(p => `${p[0]},${p[1]}`).join(" ")}
                            fill={props.fillColor}
                            stroke={NONE}
                            opacity={polygonOpacity}
                        />
                    )}
                </React.Fragment>
            )}
            {polygonPath.map((path, index) => (
                <SimpleLine
                    key={index}
                    x1={path[0][0]}
                    y1={path[0][1]}
                    x2={path[1][0]}
                    y2={path[1][1]}
                    strokeColor={props.strokeColor}
                    strokeWidth={props.strokeWidth}
                    strokeStyle={props.strokeStyle}
                />
            ))}
        </React.Fragment>
    );
};

export const ShapeElement = props => {
    const x = Math.min(props.x1, props.x2);
    const y = Math.min(props.y1, props.y2);
    const width = Math.abs(props.x2 - props.x1);
    const height = Math.abs(props.y2 - props.y1);
    const fillColor = props.fillColor ?? TRANSPARENT;
    const strokeColor = props.strokeColor ?? BLACK;
    const strokeWidth = props.strokeWidth ?? 0;
    return (
        <g transform={`translate(${x},${y})`} opacity={props.opacity}>
            {props.shape !== SHAPES.ELLIPSE && (
                <PolygonShape
                    type={props.shape}
                    width={width}
                    height={height}
                    fillStyle={props.fillStyle}
                    fillColor={fillColor}
                    strokeWidth={strokeWidth}
                    strokeColor={strokeColor}
                    strokeStyle={props.strokeStyle}
                />
            )}
            {props.shape === SHAPES.ELLIPSE && (
                <EllipseShape
                    width={width}
                    height={height}
                    fillStyle={props.fillStyle}
                    fillColor={fillColor}
                    strokeWidth={strokeWidth}
                    strokeColor={strokeColor}
                    strokeStyle={props.strokeStyle}
                />
            )}
            <rect
                data-element={props.id}
                x="0"
                y="0"
                width={Math.max(1, width)}
                height={Math.max(1, height)}
                rx="0"
                fill={TRANSPARENT}
                stroke={NONE}
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
