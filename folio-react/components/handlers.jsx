import React from "react";
import {CURSORS, HANDLERS, HANDLERS_FILL_COLOR, HANDLERS_STROKE_COLOR} from "../constants.js";
import {isCornerHandler, isEdgeHandler, isNodeHandler} from "../handlers.js";
import {isVerticalEdgeHandler, isHorizontalEdgeHandler} from "../handlers.js";
import {SvgContainer} from "./svg.jsx";

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
        fill={props.fillColor ?? HANDLERS_FILL_COLOR}
        stroke={props.strokeColor ?? HANDLERS_STROKE_COLOR}
        strokeWidth={props.strokeWidth / props.zoom}
        style={{
            cursor: CURSORS.GRAB,
        }}
        onPointerDown={props.onPointerDown}
    />
);

export const ResizeHandler = props => (
    <rect
        data-handler={props.type}
        x={props.x - (props.width / props.zoom) / 2}
        y={props.y - (props.height / props.zoom) / 2}
        width={props.width / props.zoom}
        height={props.height / props.zoom}
        rx={props.radius / props.zoom}
        fill={props.fillColor ?? HANDLERS_FILL_COLOR}
        stroke={props.strokeColor ?? HANDLERS_STROKE_COLOR}
        strokeWidth={props.strokeWidth / props.zoom}
        style={{
            cursor: cursorsByHandlerType[props.type],
        }}
        onPointerDown={props.onPointerDown}
    />
);

export const Handlers = props => (
    <SvgContainer>
        {(props.handlers || []).map(handler => (
            <React.Fragment key={handler.id ?? handler.type}>
                {(isCornerHandler(handler.type) || isEdgeHandler(handler.type)) && (
                    <ResizeHandler
                        type={handler.type}
                        x={handler.x}
                        y={handler.y}
                        width={isVerticalEdgeHandler(handler.type) ? 24 : 12}
                        height={isHorizontalEdgeHandler(handler.type) ? 24 : 12}
                        fillColor={props.fillColor}
                        strokeColor={props.strokeColor}
                        strokeWidth={4}
                        radius={isEdgeHandler(handler.type) ? 6 : 4}
                        zoom={props.zoom ?? 1}
                        onPointerDown={props.onPointerDown}
                    />
                )}
                {isNodeHandler(handler.type) && (
                    <NodeHandler
                        type={handler.type}
                        x={handler.x}
                        y={handler.y}
                        radius={6}
                        fillColor={props.fillColor}
                        strokeColor={props.strokeColor}
                        strokeWidth={4}
                        zoom={props.zoom ?? 1}
                        onPointerDown={props.onPointerDown}
                    />
                )}
            </React.Fragment>
        ))}
    </SvgContainer>
);
