export const IS_DARWIN = !!(/Mac|iPod|iPhone|iPad/.test(window.navigator.platform));

export const COLORS = [
    "rgb(0,0,0)", // black , "rgb(255,255,255)"],
    "rgb(66,72,82)", // gray "rgb(169, 176, 187)"],
    "rgb(74,136,218)", // blue "rgb(115, 176, 244)"],
    "rgb(61, 173, 217)", // aqua "rgb(102, 212, 241)"],
    "rgb(59, 186, 154)", // mint "rgb(97, 221, 189)"],
    "rgb(137, 192, 84)", // green "rgb(180, 223, 128)"],
    "rgb(149, 121, 218)", // purple "rgb(179, 164, 238)"],
    "rgb(213, 111, 172)", // pink "rgb(241, 153, 206)"],
    "rgb(245, 185, 69)", // yellow "rgb(250, 210, 119)"],
    "rgb(232, 85, 62)", // red "rgb(246, 131, 111)"],
];

export const DEFAULT_COLOR_STROKE = "rgb(0,0,0)";
export const DEFAULT_COLOR_FILL = "transparent";

export const FONTS = [
    "Noto Sans, sans-serif",
    "Noto Serif, serif",
    "Caveat Brush, cursive;",
    "Noto Sans Mono, monospace",
];

export const FONT_SIZE_SM = "12px";
export const FONT_SIZE_MD = "16px";
export const FONT_SIZE_LG = "24px";
export const FONT_SIZE_XL = "32px";

export const DEFAULT_FONT_FAMILY = FONTS[0];
export const DEFAULT_FONT_WEIGHT = "500";

export const OPACITY_NONE = "1";
export const OPACITY_SEMITRANSPARENT = "0.5";
export const OPACITY_TRANSPARENT = "0";

export const STROKE_SIZE_NONE = "0px";
export const STROKE_SIZE_SM = "2px";
export const STROKE_SIZE_MD = "4px";
export const STROKE_SIZE_LG = "8px";
export const STROKE_SIZE_XL = "16px";

export const STROKE_STYLE_SOLID = "solid";
export const STROKE_STYLE_DASHED = "dashed";
export const STROKE_STYLE_DOTTED = "dotted";

export const RADIUS_NONE = "0px";
export const RADIUS_SM = "4px";
export const RADIUS_MD = "8px";
export const RADIUS_LG = "16px";
export const RADIUS_XL = "32px";

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

export const ACTIONS = {
    CREATE_ELEMENT: "action:element:create",
    DRAG_ELEMENT: "action:element:drag",
    RESIZE_ELEMENT: "action:element:resize",
    NONE: "mode:none",
    RESIZE: "mode:resize",
    DRAG: "mode:drag",
    INPUT: "mode:input",
    SELECTION: "action:selection",
    SCREENSHOT: "action:screenshot",
    MOVE: "action:move",
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

export const VERSIONS = {
    FOLIO: process.env.VERSION,
    FOLIO_EXPORT: "1",
};
