import React from "react";
import {RESIZE_HANDLERS} from "../../constants.js";
import {useBoundaryPoints} from "../../hooks/useBoundaryPoints.js";

export const EdgeHandlers = props => {
    const width = Math.abs(props.points[1][0] - props.points[0][0]);
    const height = Math.abs(props.points[1][1] - props.points[0][1]);
    const size = props.size / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;

    return (
        <g fill="transparent">
            <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
                <line
                    x1={props.points[0][0]}
                    x2={props.points[1][0]}
                    y1={props.points[0][1]}
                    y2={props.points[0][1]}
                />
                <line
                    x1={props.points[1][0]}
                    x2={props.points[1][0]}
                    y1={props.points[0][1]}
                    y2={props.points[1][1]}
                />
                <line
                    x1={props.points[0][0]}
                    x2={props.points[1][0]}
                    y1={props.points[1][1]}
                    y2={props.points[1][1]}
                />
                <line
                    x1={props.points[0][0]}
                    x2={props.points[0][0]}
                    y1={props.points[1][1]}
                    y2={props.points[0][1]}
                />
            </g>
            <rect
                data-resizes={RESIZE_HANDLERS.EDGE_TOP}
                x={props.points[0][0]}
                y={props.points[0][1] - size / 2}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={RESIZE_HANDLERS.EDGE_BOTTOM}
                x={props.points[0][0]}
                y={props.points[1][1]}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={RESIZE_HANDLERS.EDGE_LEFT}
                x={props.points[0][0] - size / 2}
                y={props.points[0][1]}
                width={size}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={RESIZE_HANDLERS.EDGE_RIGHT}
                x={props.points[1][0]}
                y={props.points[0][1]}
                width={size}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
                onPointerDown={props.onPointerDown}
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
    onPointerDown: null,
};

export const CornerHandlers = props => {
    const width = props.width / props.zoom;
    const height = props.height / props.zoom;
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;
    return (
        <g fill={props.fillColor} stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <rect
                data-handler={RESIZE_HANDLERS.CORNER_TOP_LEFT}
                x={props.points[0][0] - width / 2}
                y={props.points[0][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={RESIZE_HANDLERS.CORNER_TOP_RIGHT}
                x={props.points[1][0] - width / 2}
                y={props.points[0][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nesw-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={RESIZE_HANDLERS.CORNER_BOTTOM_RIGHT}
                x={props.points[1][0] - width / 2}
                y={props.points[1][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={RESIZE_HANDLERS.CORNER_BOTTOM_LEFT}
                x={props.points[0][0] - width / 2}
                y={props.points[1][1] - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nesw-resize",
                }}
                onPointerDown={props.onPointerDown}
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

export const ResizeHandlers = props => {
    // At this moment we only support one element for resizing
    // const selectedElements = props.elements.filter(el => !!el.selected);
    if (props.elements.length !== 1) {
        return null;
    }
    // const points = useBoundaryPoints(props.elements?.[0] || []);
    const points = props.elements[0].points;
    return (
        <React.Fragment>
            <EdgeHandlers
                points={points}
                zoom={props.zoom}
                onPointerDown={props.onPointerDown}
            />
            <CornerHandlers
                points={points}
                zoom={props.zoom}
                onPointerDown={props.onPointerDown}
            />
        </React.Fragment>
    );
};

ResizeHandlers.defaultProps = {
    elements: [],
    zoom: 1,
    onPointerDown: null,
};
