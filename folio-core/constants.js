export const VERSION = "2";

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

export const FILE_EXTENSIONS = {
    FOLIO: ".folio",
    JSON: ".json",
    PNG: ".png",
    JPG: ".jpg",
    SVG: ".svg",
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

// Default font faces
export const FONT_FACES = {
    SANS: "Roboto, sans-serif",
    SERIF: "Roboto Slab, serif",
    DRAW: "Caveat, cursive",
    MONO: "Roboto Mono, monospace",
};

// Fonts sources
export const FONT_SOURCES = {
    SANS: "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
    SERIF: "https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap",
    DRAW: "https://fonts.googleapis.com/css2?family=Caveat&display=swap",
    MONO: "https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap",
};

// Default colors
export const COLORS = {
    TRANSPARENT: "transparent",
    WHITE: "#ffffff",
    BLACK: "#000000",
    GRAY:   "#424852", 
    BLUE:   "#4a88da",
    GREEN:  "#89c054",
    PURPLE: "#9579da",
    PINK:   "#d56fac",
    YELLOW: "#f5b945",
    RED:    "#e8553e",
};

// Common stroke widths
export const STROKE_WIDTHS = {
    SMALL: 2,
    MEDIUM: 4,
    LARGE: 8,
    XLARGE: 16,
};

// Common text sizes
export const TEXT_SIZES = {
    SMALL: 16,
    MEDIUM: 24,
    LARGE: 40,
    XLARGE: 64,
};

export const TEXT_SIZE_STEP = 8;
export const TEXT_SIZE_MIN = 8;
export const TEXT_SIZE_MAX = 256;

// Text aligns
export const TEXT_ALIGNS = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    JUSTIFY: "justify",
};

// Allowed stroke styles
export const STROKES = {
    SOLID: "solid",
    DASHED: "dashed",
    DOTTED: "dotted",
};

// Default values for style attributes of elements
export const DEFAULT_FILL_COLOR = COLORS.TRANSPARENT;
export const DEFAULT_FILL_OPACITY = OPACITY_DEFAULT;
export const DEFAULT_STROKE_COLOR = COLORS.BLACK;
export const DEFAULT_STROKE_WIDTH = STROKE_WIDTHS.MEDIUM;
export const DEFAULT_STROKE_OPACITY = OPACITY_DEFAULT;
export const DEFAULT_STROKE_STYLE = STROKES.SOLID;
export const DEFAULT_TEXT_FONT = FONT_FACES.SANS;
export const DEFAULT_TEXT_SIZE = TEXT_SIZES.MEDIUM;
export const DEFAULT_TEXT_COLOR = COLORS.BLACK;
export const DEFAULT_TEXT_ALIGN = TEXT_ALIGNS.CENTER;
export const DEFAULT_SHAPE = SHAPES.RECTANGLE;
export const DEFAULT_ARROWHEAD_START = ARROWHEADS.NONE;
export const DEFAULT_ARROWHEAD_END = ARROWHEADS.ARROW;
