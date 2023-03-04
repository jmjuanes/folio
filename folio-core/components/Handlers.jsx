import React from "react";
import {HANDLERS} from "../constants.js";

export const NodeHandlers = props => {
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;
    return (
        <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <line
                x1={props.element.x1}
                y1={props.element.y1}
                x2={props.element.x2}
                y2={props.element.y2}
                fill="none"
            />
            <circle
                data-handler={HANDLERS.NODE_START}
                cx={props.element.x1}
                cy={props.element.y1}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
                onPointerDown={props.onPointerDown}
            />
            <circle
                data-handler={HANDLERS.NODE_END}
                cx={props.element.x2}
                cy={props.element.y2}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: "grab",
                }}
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};

NodeHandlers.defaultProps = {
    element: null,
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    radius: 6,
    zoom: 1,
};

export const EdgeHandlers = props => {
    const width = Math.abs(props.element.x2 - props.element.x1);
    const height = Math.abs(props.element.y2 - props.element.y1);
    const size = props.size / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;
    return (
        <g fill="transparent">
            <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
                <line
                    x1={props.element.x1}
                    x2={props.element.x2}
                    y1={props.element.y1}
                    y2={props.element.y1}
                />
                <line
                    x1={props.element.x2}
                    x2={props.element.x2}
                    y1={props.element.y1}
                    y2={props.element.y2}
                />
                <line
                    x1={props.element.x1}
                    x2={props.element.x2}
                    y1={props.element.y2}
                    y2={props.element.y2}
                />
                <line
                    x1={props.element.x1}
                    x2={props.element.x1}
                    y1={props.element.y1}
                    y2={props.element.y2}
                />
            </g>
            <rect
                data-handler={HANDLERS.EDGE_TOP}
                x={props.element.x1}
                y={props.element.y1 - size / 2}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.EDGE_BOTTOM}
                x={props.element.x1}
                y={props.element.y2}
                width={width}
                height={size}
                style={{
                    cursor: "ns-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.EDGE_LEFT}
                x={props.element.x1 - size / 2}
                y={props.element.y1}
                width={size}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.EDGE_RIGHT}
                x={props.element.x2}
                y={props.element.y1}
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
    element: null,
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    size: 12,
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
                data-handler={HANDLERS.CORNER_TOP_LEFT}
                x={props.element.x1 - width / 2}
                y={props.element.y1 - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.CORNER_TOP_RIGHT}
                x={props.element.x2 - width / 2}
                y={props.element.y1 - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nesw-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.CORNER_BOTTOM_RIGHT}
                x={props.element.x2 - width / 2}
                y={props.element.y2 - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: "nwse-resize",
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.CORNER_BOTTOM_LEFT}
                x={props.element.x1 - width / 2}
                y={props.element.y2 - height / 2}
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
    element: null,
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    width: 12,
    height: 12,
    radius: 3,
    zoom: 1,
};

export const Handlers = props => {
    // At this moment we only support one element for resizing
    // const selectedElements = props.elements.filter(el => !!el.selected);
    if (props.elements.length !== 1) {
        return null;
    }
    const element = props.elements[0];
    return (
        <React.Fragment>
            {element.edgeHandlers && (
                <EdgeHandlers
                    element={element}
                    zoom={props.zoom}
                    onPointerDown={props.onPointerDown}
                />
            )}
            {element.cornerHandlers && (
                <CornerHandlers
                    element={element}
                    zoom={props.zoom}
                    onPointerDown={props.onPointerDown}
                />
            )}
            {element.nodeHandlers && (
                <NodeHandlers
                    element={element}
                    zoom={props.zoom}
                    onPointerDown={props.onPointerDown}
                />
            )}
        </React.Fragment>
    );
};

Handlers.defaultProps = {
    elements: [],
    zoom: 1,
    onPointerDown: null,
};
