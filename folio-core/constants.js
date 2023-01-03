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

export const ELEMENTS = {
    SHAPE: "shape",
    LINE: "line",
    ARROW: "arrow",
    IMAGE: "image",
    TEXT: "text",
    DRAW: "draw",
};

export const SHAPES = {
    RECTANGLE: "rectangle",
    ELLIPSE: "ellipse",
    DIAMOND: "diamond",
    TRIANGLE: "triangle",
};

export const ARROWHEADS = {
    NONE: "none",
    ARROW: "arrow",
    TRIANGLE: "triangle",
    SQUARE: "square",
    CIRCLE: "circle",
    SEGMENT: "segment",
};

export const STROKES = {
    SOLID: "solid",
    DASHED: "dashed",
    DOTTED: "dotted",
};

// Grid constants
export const GRID_SIZE = 20;

// Zoom constants
export const ZOOM_DEFAULT = 1;
export const ZOOM_STEP = 0.1;
export const ZOOM_MAX = 5;
export const ZOOM_MIN = 0.1;

// Opacity constants (for fill and stroke)
export const OPACITY_DEFAULT = 1;
export const OPACITY_STEP = 0.1;
export const OPACITY_MIN = 0;
export const OPACITY_MAX = 1;

export const SELECTION_FILL_COLOR = "#0d6efd";
export const SELECTION_STROKE_COLOR = "#0d6efd";

export const SCREENSHOT_FILL_COLOR = "#20c997";
export const SCREENSHOT_STROKE_COLOR = "#20c997";

export const MIME_TYPES = {
    FOLIO: "application/vnd.folio+json",
    JSON: "application/json",
    PNG: "image/png",
    JPG: "image/jpeg",
    SVG: "image/svg+xml",
};

export const EXPORT_FORMATS = {
    PNG: "PNG",
    SVG: "SVG",
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

// Allowed colors for elements
export const COLORS = {
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

// Allowed fonts for elements
export const FONTS = {
    DRAW: "draw",
    SANS: "sans",
    SERIF: "serif",
    MONO: "monospace"
};

// Allowed sizes for elements
export const SIZES = {
    NONE: "none",
    SMALL: "sm",
    MEDIUM: "md",
    LARGE: "lg",
    XLARGE: "xl",
};

// Default values for style attributes of elements
export const DEFAULT_FILL_COLOR = COLORS.NONE;
export const DEFAULT_FILL_OPACITY = 1;
export const DEFAULT_STROKE_COLOR = COLORS.BLACK;
export const DEFAULT_STROKE_WIDTH = SIZES.MEDIUM;
export const DEFAULT_STROKE_OPACITY = 1;
export const DEFAULT_STROKE_STYLE = STROKES.SOLID;
export const DEFAULT_TEXT_FONT = FONTS.SANS;
export const DEFAULT_TEXT_SIZE = SIZES.MEDIUM;
export const DEFAULT_TEXT_COLOR = COLORS.BLACK;
export const DEFAULT_SHAPE = SHAPES.RECTANGLE;
export const DEFAULT_ARROWHEAD_START = ARROWHEADS.NONE;
export const DEFAULT_ARROWHEAD_END = ARROWHEADS.ARROW;
