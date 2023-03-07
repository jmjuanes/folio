import React from "react";
import {CURSORS, HANDLERS} from "../constants.js";

export const NodeHandlers = props => {
    const radius = props.radius / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;
    return (
        <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
            <line
                x1={props.position.x1}
                y1={props.position.y1}
                x2={props.position.x2}
                y2={props.position.y2}
                fill="none"
            />
            <circle
                data-handler={HANDLERS.NODE_START}
                cx={props.position.x1}
                cy={props.position.y1}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: CURSORS.GRAB,
                }}
                onPointerDown={props.onPointerDown}
            />
            <circle
                data-handler={HANDLERS.NODE_END}
                cx={props.position.x2}
                cy={props.position.y2}
                r={radius}
                fill={props.fillColor}
                style={{
                    cursor: CURSORS.GRAB,
                }}
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};

NodeHandlers.defaultProps = {
    position: null,
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    radius: 6,
    zoom: 1,
};

export const EdgeHandlers = props => {
    const width = Math.abs(props.position.x2 - props.position.x1);
    const height = Math.abs(props.position.y2 - props.position.y1);
    const size = props.size / props.zoom;
    const strokeWidth = props.strokeWidth / props.zoom;
    return (
        <g fill="transparent">
            <g stroke={props.strokeColor} strokeWidth={strokeWidth}>
                <line
                    x1={props.position.x1}
                    x2={props.position.x2}
                    y1={props.position.y1}
                    y2={props.position.y1}
                />
                <line
                    x1={props.position.x2}
                    x2={props.position.x2}
                    y1={props.position.y1}
                    y2={props.position.y2}
                />
                <line
                    x1={props.position.x1}
                    x2={props.position.x2}
                    y1={props.position.y2}
                    y2={props.position.y2}
                />
                <line
                    x1={props.position.x1}
                    x2={props.position.x1}
                    y1={props.position.y1}
                    y2={props.position.y2}
                />
            </g>
            <rect
                data-handler={HANDLERS.EDGE_TOP}
                x={props.position.x1}
                y={props.position.y1 - size / 2}
                width={width}
                height={size}
                style={{
                    cursor: CURSORS.RESIZE_NS,
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.EDGE_BOTTOM}
                x={props.position.x1}
                y={props.position.y2}
                width={width}
                height={size}
                style={{
                    cursor: CURSORS.RESIZE_NS,
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.EDGE_LEFT}
                x={props.position.x1 - size / 2}
                y={props.position.y1}
                width={size}
                height={height}
                style={{
                    cursor: CURSORS.RESIZE_EW,
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.EDGE_RIGHT}
                x={props.position.x2}
                y={props.position.y1}
                width={size}
                height={height}
                style={{
                    cursor: CURSORS.RESIZE_EW,
                }}
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};

EdgeHandlers.defaultProps = {
    position: null,
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
                x={props.position.x1 - width / 2}
                y={props.position.y1 - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: CURSORS.RESIZE_NWSE,
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.CORNER_TOP_RIGHT}
                x={props.position.x2 - width / 2}
                y={props.position.y1 - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: CURSORS.RESIZE_NESW,
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.CORNER_BOTTOM_RIGHT}
                x={props.position.x2 - width / 2}
                y={props.position.y2 - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: CURSORS.RESIZE_NWSE,
                }}
                onPointerDown={props.onPointerDown}
            />
            <rect
                data-handler={HANDLERS.CORNER_BOTTOM_LEFT}
                x={props.position.x1 - width / 2}
                y={props.position.y2 - height / 2}
                width={width}
                height={height}
                rx={radius}
                style={{
                    cursor: CURSORS.RESIZE_NESW,
                }}
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};

CornerHandlers.defaultProps = {
    position: null,
    fillColor: "#fff",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    width: 12,
    height: 12,
    radius: 3,
    zoom: 1,
};

export const Handlers = props => (
    <React.Fragment>
        {props.edgeHandlers && (
            <EdgeHandlers
                position={props.position}
                zoom={props.zoom}
                onPointerDown={props.onPointerDown}
            />
        )}
        {props.cornerHandlers && (
            <CornerHandlers
                position={props.position}
                zoom={props.zoom}
                onPointerDown={props.onPointerDown}
            />
        )}
        {props.nodeHandlers && (
            <NodeHandlers
                position={props.position}
                zoom={props.zoom}
                onPointerDown={props.onPointerDown}
            />
        )}
    </React.Fragment>
);

Handlers.defaultProps = {
    position: {},
    edgeHandlers: false,
    cornerHandlers: false,
    nodeHandlers: false,
    zoom: 1,
    onPointerDown: null,
};
