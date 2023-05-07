export const isCornerHandler = handler => {
    return handler.startsWith("corner");
};

export const isEdgeHandler = handler => {
    return handler.startsWith("edge");
};

// Check if the event is fired from touch or pen
export const isTouchOrPenEvent = event => {
    return event.pointerType !== "mouse";
};

// Automatically prevent default in the specified event
export const preventDefault = event => {
    event.preventDefault();
};

// Wrapper around window.setTimeout
export const delay = (timeout, callback) => {
    return window.setTimeout(callback, timeout);
};
