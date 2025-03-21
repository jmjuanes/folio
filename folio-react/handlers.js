import {HANDLERS} from "./constants.js";

export const isCornerHandler = handler => {
    return handler.startsWith("corner");
};

export const isEdgeHandler = handler => {
    return handler.startsWith("edge");
};

export const isVerticalEdgeHandler = handler => {
    return handler === HANDLERS.EDGE_TOP || handler === HANDLERS.EDGE_BOTTOM;
};

export const isHorizontalEdgeHandler = handler => {
    return handler === HANDLERS.EDGE_LEFT || handler === HANDLERS.EDGE_RIGHT;
};

export const isNodeHandler = handler => {
    return handler.startsWith("node");
};
