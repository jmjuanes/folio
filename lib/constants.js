import {STICKYNOTE_COLORS} from "./utils/colors.js";

export const VERSION = "9";

export const IS_DARWIN = !!(/Mac|iPod|iPhone|iPad/.test(window.navigator.platform));

export const PI = Math.PI;
export const EPSILON = 1e-6;

export const POLYGON = {
    RECTANGLE: "rectangle",
    DIAMOND: "diamond",
    TRIANGLE: "triangle",
};

export const NONE = "none";
export const TRANSPARENT = "transparent";
export const WHITE = "#ffffff";
export const BLACK = "#000000";
export const PRIMARY = "#0d6efd";
export const SECONDARY = "#20c997";
export const ACCENT = "#5e5c6c";

export const EVENTS = {
    POINTER_DOWN: "pointerdown",
    POINTER_MOVE: "pointermove",
    POINTER_UP: "pointerup",
    DOUBLE_CLICK: "dblclick",
    KEY_DOWN: "keydown",
    KEY_UP: "keyup",
    PASTE: "paste",
    RESIZE: "resize",
    WHEEL: "wheel",
    TOUCH_START: "touchstart",
    TOUCH_END: "touchend",
    TOUCH_MOVE: "touchmove",
    GESTURE_START: "gesturestart",
    GESTURE_CHANGE: "gesturechange",
    GESTURE_END: "gestureend",
};

export const CURSORS = {
    NONE: "",
    DEFAULT: "default",
    DISABLED: "not-allowed",
    POINTER: "pointer",
    CROSS: "crosshair",
    TEXT: "text",
    GRAB: "grab",
    GRABBING: "grabbing",
    MOVE: "move",
    RESIZE_EW: "ew-resize",
    RESIZE_NS: "ns-resize",
    RESIZE_NESW: "nesw-resize",
    RESIZE_NWSE: "nwse-resize",
};

export const ELEMENTS = {
    SHAPE: "shape",
    LINE: "line",
    ARROW: "arrow",
    IMAGE: "image",
    TEXT: "text",
    DRAW: "draw",
    NOTE: "note",
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

export const OPACITY_HALF = 0.5;
export const OPACITY_NONE = 0;
export const OPACITY_FULL = 1;

// Drawing constants
export const DRAWING_THRESHOLD = 3;
export const DRAWING_OFFSET = 10;

// Hatch fill constants
export const HATCH_ANGLE = PI / 4;
export const HATCH_GAP = 4;

// Text box constants
export const TEXT_BOX_MIN_WIDTH = 400;

// Shapes constants
export const SHAPE_MIN_WIDTH = 150;
export const SHAPE_MIN_HEIGHT = 150;
export const SHAPE_PADDING = 2;

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

// Export constants
export const EXPORT_PADDING = 16;
export const EXPORT_OFFSET = 0.5;
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
    NODE_MIDDLE: "node-middle",
};

// Default font faces
export const FONT_FACES = {
    DRAW: "Caveat Brush, cursive",
    SANS: "Roboto, sans-serif",
    SERIF: "Roboto Slab, serif",
    MONO: "Roboto Mono, monospace",
};

// Fonts sources
export const FONT_SOURCES = {
    DRAW: "https://fonts.googleapis.com/css2?family=Caveat+Brush&display=swap",
    SANS: "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
    SERIF: "https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap",
    MONO: "https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap",
};

// Fill styles
export const FILL_STYLES = {
    NONE: "none",
    HATCH: "hatch",
    TRANSPARENT: "transparent",
    SOLID: "solid",
};

// Common stroke widths
export const STROKE_WIDTHS = {
    SMALL: 2,
    MEDIUM: 4,
    LARGE: 6,
    XLARGE: 8,
};

// Common text sizes
export const TEXT_SIZES = {
    XSMALL: 8,
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
    NONE: "none",
    SOLID: "solid",
    DASHED: "dashed",
    DOTTED: "dotted",
};

// Default values for style attributes of elements
export const DEFAULTS = {
    FILL_COLOR: WHITE,
    FILL_STYLE: FILL_STYLES.SOLID,
    STROKE_COLOR: BLACK,
    STROKE_WIDTH: STROKE_WIDTHS.MEDIUM,
    STROKE_STYLE: STROKES.SOLID,
    TEXT_FONT: FONT_FACES.DRAW,
    TEXT_SIZE: TEXT_SIZES.MEDIUM,
    TEXT_COLOR: BLACK,
    TEXT_ALIGN: TEXT_ALIGNS.CENTER,
    SHAPE: SHAPES.RECTANGLE,
    ARROWHEAD_START: ARROWHEADS.NONE,
    ARROWHEAD_END: ARROWHEADS.ARROW,
    OPACITY: OPACITY_DEFAULT,
    NOTE_COLOR: STICKYNOTE_COLORS.yellow,
};

// Fields in elements
export const FIELDS = {
    FILL_COLOR: "fillColor",
    FILL_STYLE: "fillStyle",
    STROKE_COLOR: "strokeColor",
    STROKE_WIDTH: "strokeWidth",
    STROKE_STYLE: "strokeStyle",
    TEXT: "text",
    TEXT_WIDTH: "textWidth",
    TEXT_HEIGHT: "textHeight",
    TEXT_COLOR: "textColor",
    TEXT_FONT: "textFont",
    TEXT_SIZE: "textSize",
    TEXT_ALIGN: "textAlign",
    SHAPE: "shape",
    START_ARROWHEAD: "startArrowhead",
    END_ARROWHEAD: "endArrowhead",
    OPACITY: "opacity",
    ORDER: "order",
    LOCKED: "locked",
    NOTE_COLOR: "noteColor",
    NOTE_TEXT: "noteText",
};

// Deprecated fields
// Only maintained for the migration script
export const DEPRECATED_FIELDS = {
    BLUR: "blur",
    FILL_OPACITY: "fillOpacity",
    STROKE_OPACITY: "strokeOpacity",
    GROUP: "group",
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

// Form option types
export const FORM_OPTIONS = {
    COLOR: "color",
    SELECT: "select",
    LABELED_SELECT: "labeledSelect",
    COLOR_SELECT: "colorSelect",
    FONT: "font",
    RANGE: "range",
    CHECKBOX: "checkbox",
    PIXELS: "pixels",
    SEPARATOR: "separator",
};

export const THEMES = {
    LIGHT: "light",
    DARK: "dark",
};

export const ACTIONS = {
    MOVE: "action:move",
    SELECT: "action:select",
    CREATE: "action:create",
    TRANSLATE: "action:translate",
    RESIZE: "actionresize",
    EDIT: "action:edit",
    ERASE: "action:erase",
    SCREENSHOT: "action:screenshot",
    POINTER: "action:pointer",
};

export const CHANGES = {
    CREATE: "change:create",
    UPDATE: "change:update",
    REMOVE: "change:remove",
};

export const STATES = {
    IDLE: "idle",
    POINTING: "pointing",
    DRAGGING: "dragging",
    CREATING: "creating",
    RESIZING: "resizing",
    TRANSLATING: "translating",
    BRUSHING: "brushing",
    ERASING: "erasing",
};

// Paste constants
export const PASTE_OFFSET = 20;

// Selection brush constants
export const SELECTION_FILL_COLOR = PRIMARY;
export const SELECTION_STROKE_COLOR = PRIMARY;

// Select bounds constants
export const SELECT_BOUNDS_FILL_COLOR = NONE;
export const SELECT_BOUNDS_STROKE_COLOR = PRIMARY;

// Sticky notes constants
export const NOTE_MIN_WIDTH = 280;
export const NOTE_MIN_HEIGHT = 280;
export const NOTE_TEXT_COLOR = BLACK;
export const NOTE_TEXT_ALIGN = TEXT_ALIGNS.LEFT;
export const NOTE_TEXT_SIZE = TEXT_SIZES.MEDIUM;
export const NOTE_TEXT_FONT = FONT_FACES.DRAW;
export const NOTE_PADDING = 16;
export const NOTE_PLACEHOLDER = "Type something...";

// Laser pointer constants
export const POINTER_COLOR = "#e01010";
export const POINTER_WIDTH = 10;
export const POINTER_DELAY = 750;
export const POINTER_INTERVAL_DELAY = 50;
export const POINTER_TENSION = 0.5 * 12;
