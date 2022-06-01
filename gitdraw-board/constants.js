// Available keys
export const KEYS = {
    ESCAPE: "Escape",
    BACKSPACE: "Backspace",
    ARROW_DOWN: "ArrowDown",
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_UP: "ArrowUp",
};

// Available interaction modes
export const INTERACTION_MODES = {
    RESIZE: Symbol("mode:resize"),
    DRAG: Symbol("mode:drag"),
    INPUT: Symbol("mode:input"),
};

// Line caps
export const LINE_CAPS = {
    NONE: "none",
    ARROW: "arrow",
    SQUARE: "square",
    CIRCLE: "circle",
};

// Text align
export const TEXT_ALIGNS = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
};

// Text vertical aligns
export const TEXT_VERTICAL_ALIGNS = {
    TOP: "top",
    MIDDLE: "middle",
    BOTTOM: "bottom",
};

// Elements types
export const ELEMENT_TYPES = {
    SELECTION: "selection",
    SCREENSHOT: "screenshot",
    SHAPE_RECTANGLE: "rectangle",
    SHAPE_ELLIPSE: "ellipse",
    SHAPE_LINE: "line",
    IMAGE: "image",
    TEXT: "text",
    GROUP: "group",
};

export const RESIZE_TYPES = {
    NONE: "none",
    PRIMARY: "primary", // lt and rb
    ALL: "all", // all orientations
};

export const RESIZE_ORIENTATIONS = {
    LEFT: "l",
    RIGHT: "r",
    TOP: "t",
    BOTTOM: "b",
    LEFT_TOP: "lt",
    LEFT_BOTTOM: "lb",
    RIGHT_TOP: "rt",
    RIGHT_BOTTOM: "rb",
};
