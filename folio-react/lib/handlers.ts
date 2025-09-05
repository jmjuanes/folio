import { HANDLERS } from "../constants.js";

export const isCornerHandler = (handler: string): boolean => {
    return handler.startsWith("corner");
};

export const isEdgeHandler = (handler: string): boolean => {
    return handler.startsWith("edge");
};

export const isVerticalEdgeHandler = (handler: string): boolean => {
    return handler === HANDLERS.EDGE_TOP || handler === HANDLERS.EDGE_BOTTOM;
};

export const isHorizontalEdgeHandler = (handler: string): boolean => {
    return handler === HANDLERS.EDGE_LEFT || handler === HANDLERS.EDGE_RIGHT;
};

export const isNodeHandler = (handler: string): boolean => {
    return handler.startsWith("node");
};

export const isRotationHandler = (handler: string): boolean => {
    return handler === HANDLERS.ROTATION;
};
