import React from "react";
import {HANDLERS, POINT_SOURCES} from "../../constants.js";
import {useBoundaryPoints} from "../../hooks/useBoundaryPoints.js";

export const EdgeHandlers = props => {
    const width = props.points[1][0] - props.points[0][0];
    const height = props.points[2][1] - props.points[1][1];
    const size = props.size / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;

    return (
        <g fill="transparent">
            <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
                <line
                    x1={props.points[0][0]}
                    x2={props.points[1][0]}
                    y1={props.points[0][1]}
                    y2={props.points[1][1]}
                />
                <line
                    x1={props.points[1][0]}
                    x2={props.points[2][0]}
                    y1={props.points[1][1]}
                    y2={props.points[2][1]}
                />
                <line
                    x1={props.points[2][0]}
                    x2={props.points[3][0]}
                    y1={props.points[2][1]}
                    y2={props.points[3][1]}
                />
                <line
                    x1={props.points[3][0]}
                    x2={props.points[0][0]}
                    y1={props.points[3][1]}
                    y2={props.points[0][1]}
                />
            </g>
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_TOP}
                x={props.points[0][0]}
                y={props.points[0][1] - size / 2}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_BOTTOM}
                x={props.points[3][0]}
                y={props.points[3][1]}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_LEFT}
                x={props.points[0][0] - size / 2}
                y={props.points[0][1]}
                width={size}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.EDGE_RIGHT}
                x={props.points[1][0]}
                y={props.points[1][1]}
                width={size}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
            />
        </g>
    );
};

EdgeHandlers.defaultProps = {
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    size: 12,
    points: [],
    zoom: 1,
};

export const CornerHandlers = props => {
    const width = props.width / props.zoom;
    const height = props.height / props.zoom;
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;
    return (
        <g fill={props.fillColor} stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_TOP_LEFT}
                x={props.points[0][0] - width / 2}
                y={props.points[0][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_TOP_RIGHT}
                x={props.points[1][0] - width / 2}
                y={props.points[1][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nesw-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_BOTTOM_RIGHT}
                x={props.points[2][0] - width / 2}
                y={props.points[2][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
            />
            <rect
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.CORNER_BOTTOM_LEFT}
                x={props.points[3][0] - width / 2}
                y={props.points[3][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nesw-resize",
                }}
            />
        </g>
    );
};

CornerHandlers.defaultProps = {
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    width: 12,
    height: 12,
    radius: 3,
    zoom: 1,
};

export const PointHandlers = props => {
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;

    return (
        <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <line
                x1={props.points[0][0]}
                y1={props.points[0][1]}
                x2={props.points[1][0]}
                y2={props.points[1][1]}
                fill="none"
            />
            <circle
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.POINT_START}
                cx={props.points[0][0]}
                cy={props.points[0][1]}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
            />
            <circle
                data-type={POINT_SOURCES.HANDLER}
                data-value={HANDLERS.POINT_END}
                cx={props.points[1][0]}
                cy={props.points[1][1]}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
            />
        </g>
    );
};

PointHandlers.defaultProps = {
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    radius: 6,
    points: [],
    zoom: 1,
};

export const Handlers = props => {
    const selectedElements = props.elements.filter(el => !!el.selected);
    if (selectedElements.length !== 1) {
        return null;
    }
    const element = selectedElements[0];
    const handlerType = props.tools[element.type].handlers || HANDLERS_TYPES.NONE;
    const points = useBoundaryPoints(element);

    return (
        <React.Fragment>
            {handlerType === HANDLERS_TYPES.RECTANGLE && (
                <React.Fragment>
                    <EdgeHandlers
                        zoom={props.zoom}
                        points={points}
                    />
                    <CornerHandlers
                        zoom={props.zoom}
                        points={points}
                    />
                </React.Fragment>
            )}
            {handlerType === HANDLERS_TYPES.POINTS && (
                <PointHandlers
                    zoom={props.zoom}
                    points={points}
                />
            )}
        </React.Fragment>
    );
};

Handlers.defaultProps = {
    tools: {},
    elements: [],
    zoom: 1,
};
