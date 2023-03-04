export const isCornerHandler = handler => {
    return handler.startsWith("corner");
};

export const isEdgeHandler = handler => {
    return handler.startsWith("edge");
};
