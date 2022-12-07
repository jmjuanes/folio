export const IS_DARWIN = !!(/Mac|iPod|iPhone|iPad/.test(window.navigator.platform));

export const EVENTS = {
    POINTER_DOWN: "pointerdown",
    POINTER_MOVE: "pointermove",
    POINTER_UP: "pointerup",
    DOUBLE_CLICK: "dblclick",
    KEY_DOWN: "keydown",
    KEY_UP: "keyup",
    PASTE: "paste",
    RESIZE: "resize",
};

export const KEYS = {
    ESCAPE: "Escape",
    BACKSPACE: "Backspace",
    ARROW_DOWN: "ArrowDown",
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_UP: "ArrowUp",
    C: "c",
    P: "p",
    X: "x",
    Z: "z",
    Y: "y",
};

export const ELEMENTS = {
    RECTANGLE: "element:rectangle",
    ELLIPSE: "element:ellipse",
    LINE: "element:line",
    ARROW: "element:arrow",
    IMAGE: "element:image",
    TEXT: "element:text",
    DRAW: "element:draw",
};

export const ACTIONS = {
    MOVE: "action:move",
    SELECT: "action:select",
    SCREENSHOT: "action:screenshot",
    CREATE: "action:create",
    DRAG: "action:drag",
    RESIZE: "actionresize",
    EDIT: "action:edit",
};

export const CHANGES = {
    CREATE: "change:create",
    UPDATE: "change:update",
    REMOVE: "change:remove",
};

export const GRID_SIZE = 20;

export const ZOOM_INITIAL = 1;
export const ZOOM_STEP = 0.1;
export const ZOOM_MAX = 5;
export const ZOOM_MIN = 0.1;

export const SELECTION_FILL_COLOR = "#0d6efd";
export const SELECTION_STROKE_COLOR = "#0d6efd";

export const SCREENSHOT_FILL_COLOR = "#20c997";
export const SCREENSHOT_STROKE_COLOR = "#20c997";

export const DATA_TYPES = {
    FOLIO_EXPORT: "folio/export_json",
    FOLIO_CLIPBOARD: "folio/clipboard",
};

export const MIME_TYPES = {
    FOLIO_EXPORT: "application/vnd.folio+json",
    JSON: "application/json",
    PNG: "image/png",
    JPG: "image/jpeg",
    SVG: "image/svg+xml",
};

export const HANDLERS = {
    EDGE_TOP: "edge-top",
    EDGE_BOTTOM: "edge-bottom",
    EDGE_LEFT: "edge-left",
    EDGE_RIGHT: "edge-right",
    CORNER_TOP_LEFT: "corner-top-left",
    CORNER_TOP_RIGHT: "corner-top-right",
    CORNER_BOTTOM_LEFT: "corner-bottom-left",
    CORNER_BOTTOM_RIGHT: "corner-bottom-right",
    NODE_START: "node-start",
    NODE_END: "node-end",
};

//
// Styles keys
//

export const COLOR_KEYS = {
    NONE: "none",
    WHITE: "white",
    GRAY: "gray",
    BLACK: "black",
    BLUE: "blue",
    GREEN: "green",
    PURPLE: "purple",
    PINK: "pink",
    YELLOW: "yellow",
    RED: "red",
};

export const FONT_KEYS = {
    SANS: "sans",
    SERIF: "serif",
    MONO: "monospace"
};

export const SIZE_KEYS = {
    NONE: "none",
    SMALL: "sm",
    MEDIUM: "md",
    LARGE: "lg",
    XLARGE: "xl",
};

export const DASH_KEYS = {
    SOLID: "solid",
    DASHED: "dashed",
    DOTTED: "dotted",
};

export const OPACITY_KEYS = {
    NONE: 1,
    SEMI_TRANSPARENT: 0.5,
    TRANSPARENT: 0,
};
