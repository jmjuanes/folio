export const IS_DARWIN = !!(/Mac|iPod|iPhone|iPad/.test(window.navigator.platform));

export const LIGHT_COLORS = Object.values({
    default: "rgb(255,255,255)",
    gray: "rgb(169, 176, 187)",
    blue: "rgb(115, 176, 244)",
    aqua: "rgb(102, 212, 241)",
    mint: "rgb(97, 221, 189)",
    green: "rgb(180, 223, 128)",
    purple: "rgb(179, 164, 238)",
    pink: "rgb(241, 153, 206)",
    yellow: "rgb(250, 210, 119)",
    red: "rgb(246, 131, 111)",
});

export const DARK_COLORS = Object.values({
    default: "rgb(0,0,0)",
    gray: "rgb(66, 72, 82)",
    blue: "rgb(74, 136, 218)",
    aqua: "rgb(61, 173, 217)",
    mint: "rgb(59, 186, 154)",
    green: "rgb(137, 192, 84)",
    purple: "rgb(149, 121, 218)",
    pink: "rgb(213, 111, 172)",
    yellow: "rgb(245, 185, 69)",
    red: "rgb(232, 85, 62)",
});

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

export const MODES = {
    NONE: "mode:none",
    RESIZE: "mode:resize",
    DRAG: "mode:drag",
    INPUT: "mode:input",
    SELECTION: "mode:selection",
    SCREENSHOT: "mode:screenshot",
    MOVE: "mode:move",
};

export const LINE_CAPS = {
    NONE: "none",
    ARROW: "arrow",
    SQUARE: "square",
    CIRCLE: "circle",
};

export const TEXT_ALIGNS = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
};

export const TEXT_VERTICAL_ALIGNS = {
    TOP: "top",
    MIDDLE: "middle",
    BOTTOM: "bottom",
};

export const ELEMENT_TYPES = {
    SHAPE_RECTANGLE: "rectangle",
    SHAPE_ELLIPSE: "ellipse",
    SHAPE_LINE: "line",
    IMAGE: "image",
    TEXT: "text",
    HAND_DRAW: "hand_draw",
};

export const ELEMENT_CHANGE_TYPES = {
    CREATE: "element:create",
    UPDATE: "element:update",
    REMOVE: "element:remove",
};

export const RESIZE_TYPES = {
    NONE: "none",
    MAIN_DIAGONAL: "main-diagonal", // lt and rb
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

export const GRID_STYLES = {
    DOTS: "grid-dots",
    LINES: "grid-lines",
};

export const ZOOM_INITIAL = 1;
export const ZOOM_STEP = 0.1;
export const ZOOM_MAX = 5;
export const ZOOM_MIN = 0.1;

export const DEFAULT_APP_TITLE = "Folio";

export const DEFAULT_FILL_COLOR = "rgb(255,255,255)";
export const DEFAULT_STROKE_COLOR = "rgb(0,0,0)";
export const DEFAULT_TEXT_COLOR = "rgb(0,0,0)";
export const DEFAULT_FONT = "sans-serif";

export const DEFAULT_SELECTION_COLOR = "rgb(78, 145, 228)";
export const DEFAULT_SELECTION_OPACITY = 0.1;

export const DEFAULT_GRID_COLOR = "rgb(238, 242, 247)";
export const DEFAULT_GRID_WIDTH = 1;
export const DEFAULT_GRID_OPACITY = 0.8;
export const DEFAULT_GRID_SIZE = 10;
export const DEFAULT_GRID_STYLE = GRID_STYLES.LINES;

export const DEFAULT_ELEMENT_SELECTION_COLOR = "rgb(0,0,0)";
export const DEFAULT_ELEMENT_SELECTION_WIDTH = 0.5;
export const DEFAULT_ELEMENT_SELECTION_OPACITY = 1.0;
export const DEFAULT_ELEMENT_SELECTION_OFFSET = 4;

export const DEFAULT_ELEMENT_RESIZE_COLOR = "rgb(0,0,0)";
export const DEFAULT_ELEMENT_RESIZE_WIDTH = 0.5;
export const DEFAULT_ELEMENT_RESIZE_OPACITY = 1.0;
export const DEFAULT_ELEMENT_RESIZE_RADIUS = 5;

export const DEFAULT_GROUP_SELECTION_COLOR = "rgb(0,0,0)";
export const DEFAULT_GROUP_SELECTION_WIDTH = 0.5;
export const DEFAULT_GROUP_SELECTION_OPACITY = 1;
export const DEFAULT_GROUP_SELECTION_OFFSET = 8;
