export const IS_DARWIN = !!(/Mac|iPod|iPhone|iPad/.test(window.navigator.platform));

export const COLORS = [
    "transparent",
    "white", // White
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
export const DEFAULT_COLOR_TEXT = "rgb(0,0,0)";

export const FONTS = [
    "Noto Sans, sans-serif",
    "Noto Serif, serif",
    "Caveat Brush, cursive;",
    "Noto Sans Mono, monospace",
];

export const FONT_SIZE_SM = 12;
export const FONT_SIZE_MD = 16;
export const FONT_SIZE_LG = 24;
export const FONT_SIZE_XL = 32;

export const DEFAULT_FONT_FAMILY = FONTS[0];
export const DEFAULT_FONT_SIZE = FONT_SIZE_MD;
export const DEFAULT_FONT_WEIGHT = "500";

export const OPACITY_NONE = 1;
export const OPACITY_SEMITRANSPARENT = 0.5;
export const OPACITY_TRANSPARENT = 0;

export const STROKE_SIZE_NONE = 0;
export const STROKE_SIZE_SM = 2;
export const STROKE_SIZE_MD = 4;
export const STROKE_SIZE_LG = 8;
export const STROKE_SIZE_XL = 16;

export const STROKE_STYLE_SOLID = "solid";
export const STROKE_STYLE_DASHED = "dashed";
export const STROKE_STYLE_DOTTED = "dotted";

export const RADIUS_NONE = 0;
export const RADIUS_SM = 4;
export const RADIUS_MD = 8;
export const RADIUS_LG = 16;
export const RADIUS_XL = 32;

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
    RECTANGLE: "rectangle",
    ELLIPSE: "ellipse",
    LINE: "line",
    ARROW: "arrow",
    IMAGE: "image",
    TEXT: "text",
    DRAW: "draw",
};

export const ELEMENT_ACTIONS = {
    CREATE: "element:action:create",
    DRAG: "element:action:drag",
    RESIZE: "element:actionresize",
    EDIT: "element:action:edit",
};

export const ELEMENT_CHANGES = {
    CREATE: "element:change:create",
    UPDATE: "element:change:update",
    REMOVE: "element:change:remove",
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
    NODE_START: "point-start",
    NODE_END: "point-end",
};

// Styles keys

export const COLOR_KEYS = {
    // WHITE: "white",
    LIGHT_GRAY: "light-gray",
    DARK_GRAY: "dark-gray",
    BLACK: "black",
};

export const FONT_KEYS = {
    SANS: "sans",
    SERIF: "serif",
    MONO: "monospace"
};

export const SIZE_KEYS = {
    SMALL: "sm",
    MEDIUM: "md",
    LARGE: "lg",
    EXTRA_LARGE: "xl",
};

export const DASH_KEYS = {
    SOLID: "solid",
    DASHED: "dashed",
    DOTTED: "dotted",
};
