import React from "react";
import {DASH_KEYS, SHAPES} from "../../constants.js";
import {
    getBalancedDash,
    // getRectanglePerimeter,
    getEllipsePerimeter,
    getPointsDistance,
} from "../../utils/index.js";
import {
    fillColors,
    strokeColors,
    strokeWidths,
} from "../../styles.js";

// Simple line for shapes
const SimpleLine = props => {
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const strokeStyle = props.strokeStyle;
            const length = getPointsDistance(
                [props.x1, props.y1],
                [props.x2, props.y2],
            );
            if (strokeStyle === DASH_KEYS.DASHED || strokeStyle === DASH_KEYS.DOTTED) {
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
            strokeOpacity={props.strokeOpacity}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};

const RectangleShape = props => (
    <React.Fragment>
        <rect
            x={0}
            y={0}
            width={props.width}
            height={props.height}
            fill={props.fillColor}
            fillOpacity={props.fillOpacity}
            stroke="none"
        />
        <SimpleLine
            x1={0}
            y1={0}
            x2={props.width}
            y2={0}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={props.width}
            y1={0}
            x2={props.width}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={0}
            y1={0}
            x2={0}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={0}
            y1={props.height}
            x2={props.width}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
    </React.Fragment>
);

const EllipseShape = props => {
    const rx = props.width / 2;
    const ry = props.height / 2;
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getEllipsePerimeter(rx, ry);
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === DASH_KEYS.DASHED || strokeStyle === DASH_KEYS.DOTTED) {
                return getBalancedDash(length, props.strokeWidth, strokeStyle);
            }
            return ["none", "none"];
        },
        [rx, ry, props.strokeWidth, props.strokeStyle],
    );
    return (
        <ellipse
            cx={rx}
            cy={ry}
            rx={rx}
            ry={ry}
            fill={props.fillColor}
            fillOpacity={props.fillOpacity}
            stroke={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeOpacity={props.strokeOpacity}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};

const DiamondShape = props => (
    <React.Fragment>
        <polygon
            points={`${props.width/2},0 ${props.width},${props.height/2} ${props.width/2},${props.height} 0,${props.height/2}`}
            fill={props.fillColor}
            fillOpacity={props.fillOpacity}
            stroke="none"
        />
        <SimpleLine
            x1={props.width / 2}
            y1={0}
            x2={props.width}
            y2={props.height / 2}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={props.width}
            y1={props.height / 2}
            x2={props.width / 2}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={props.width / 2}
            y1={0}
            x2={0}
            y2={props.height / 2}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={0}
            y1={props.height / 2}
            x2={props.width / 2}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
    </React.Fragment>
);

const TriangleShape = props => (
    <React.Fragment>
        <polygon
            points={`0,${props.height} ${props.width/2},0 ${props.width},${props.height}`}
            fill={props.fillColor}
            fillOpacity={props.fillOpacity}
            stroke="none"
        />
        <SimpleLine
            x1={props.width / 2}
            y1={0}
            x2={props.width}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={props.width / 2}
            y1={0}
            x2={0}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
        <SimpleLine
            x1={0}
            y1={props.height}
            x2={props.width}
            y2={props.height}
            strokeColor={props.strokeColor}
            strokeWidth={props.strokeWidth}
            strokeStyle={props.strokeStyle}
        />
    </React.Fragment>
);

export const ShapeElement = props => {
    const x = Math.min(props.x1, props.x2);
    const y = Math.min(props.y1, props.y2);
    const width = Math.abs(props.x2 - props.x1);
    const height = Math.abs(props.y2 - props.y1);
    const fillColor = fillColors[props.fillColor];
    const strokeColor = strokeColors[props.strokeColor];
    const strokeWidth = strokeWidths[props.strokeWidth];
    return (
        <g transform={`translate(${x},${y})`}>
            {props.shape === SHAPES.RECTANGLE && (
                <RectangleShape
                    width={props.width}
                    height={props.height}
                    fillColor={props.fillColor}
                    fillOpacity={props.fillOpacity}
                    strokeWidth={props.strokeWidth}
                    strokeColor={props.strokeColor}
                    strokeStyle={props.strokeStyle}
                />
            )}
            {props.shape === SHAPES.ELLIPSE && (
                <EllipseShape
                    width={props.width}
                    height={props.height}
                    fillColor={props.fillColor}
                    fillOpacity={props.fillOpacity}
                    strokeWidth={props.strokeWidth}
                    strokeColor={props.strokeColor}
                    strokeStyle={props.strokeStyle}
                />
            )}
            {props.shape === SHAPES.TRIANGLE && (
                <TriangleShape
                    width={props.width}
                    height={props.height}
                    fillColor={props.fillColor}
                    fillOpacity={props.fillOpacity}
                    strokeWidth={props.strokeWidth}
                    strokeColor={props.strokeColor}
                    strokeStyle={props.strokeStyle}
                />
            )}
            {props.shape === SHAPES.DIAMOND && (
                <DiamondShape
                    width={props.width}
                    height={props.height}
                    fillColor={props.fillColor}
                    fillOpacity={props.fillOpacity}
                    strokeWidth={props.strokeWidth}
                    strokeColor={props.strokeColor}
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
                fill="transparent"
                stroke="none"
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
