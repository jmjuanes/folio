import React from "react";
import {CURSORS, HANDLERS, PRIMARY, WHITE} from "@lib/constants.js";
import {SvgContainer} from "@components/commons/svg.jsx";

export const isCornerHandler = handler => {
    return handler.startsWith("corner");
};

export const isEdgeHandler = handler => {
    return handler.startsWith("edge");
};

export const isNodeHandler = handler => {
    return handler.startsWith("node");
};

const cursorsByHandlerType = {
    [HANDLERS.EDGE_TOP]: CURSORS.RESIZE_NS,
    [HANDLERS.EDGE_BOTTOM]: CURSORS.RESIZE_NS,
    [HANDLERS.EDGE_LEFT]: CURSORS.RESIZE_EW,
    [HANDLERS.EDGE_RIGHT]: CURSORS.RESIZE_EW,
    [HANDLERS.CORNER_TOP_LEFT]: CURSORS.RESIZE_NWSE,
    [HANDLERS.CORNER_BOTTOM_RIGHT]: CURSORS.RESIZE_NWSE,
    [HANDLERS.CORNER_TOP_RIGHT]: CURSORS.RESIZE_NESW,
    [HANDLERS.CORNER_BOTTOM_LEFT]: CURSORS.RESIZE_NESW,
};

export const NodeHandler = props => (
    <circle
        data-handler={props.type}
        cx={props.x}
        cy={props.y}
        r={props.radius / props.zoom}
        fill={props.fillColor}
        stroke={props.strokeColor}
        strokeWidth={props.strokeWidth / props.zoom}
        style={{
            cursor: CURSORS.GRAB,
        }}
        onPointerDown={props.onPointerDown}
    />
);

NodeHandler.defaultProps = {
    type: null,
    x: 0,
    y: 0,
    fillColor: WHITE,
    strokeColor: PRIMARY,
    strokeWidth: 2,
    radius: 6,
    zoom: 1,
};

export const ResizeHandler = props => (
    <rect
        data-handler={props.type}
        x={props.x - (props.width / props.zoom) / 2}
        y={props.y - (props.height / props.zoom) / 2}
        width={props.width / props.zoom}
        height={props.height / props.zoom}
        rx={props.radius / props.zoom}
        fill={props.fillColor}
        stroke={props.strokeColor}
        strokeWidth={props.strokeWidth / props.zoom}
        style={{
            cursor: cursorsByHandlerType[props.type],
        }}
        onPointerDown={props.onPointerDown}
    />
);

ResizeHandler.defaultProps = {
    type: null,
    x: 0,
    y: 0,
    fillColor: WHITE,
    strokeColor: PRIMARY,
    strokeWidth: 2,
    width: 12,
    height: 12,
    radius: 3,
    zoom: 1,
};

export const Handlers = props => (
    <SvgContainer>
        {(props.handlers || []).map(handler => (
            <React.Fragment key={handler.id ?? handler.type}>
                {(isCornerHandler(handler.type) || isEdgeHandler(handler.type)) && (
                    <ResizeHandler
                        type={handler.type}
                        x={handler.x}
                        y={handler.y}
                        zoom={props.zoom}
                        onPointerDown={props.onPointerDown}
                    />
                )}
                {isNodeHandler(handler.type) && (
                    <NodeHandler
                        type={handler.type}
                        x={handler.x}
                        y={handler.y}
                        zoom={props.zoom}
                        onPointerDown={props.onPointerDown}
                    />
                )}
            </React.Fragment>
        ))}
    </SvgContainer>
);

Handlers.defaultProps = {
    handlers: [],
    zoom: 1,
    onPointerDown: null,
};
