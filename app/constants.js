import {STICKYNOTE_COLORS} from "./utils/colors.js";

export const VERSION = "12";

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
export const PRIMARY = "#5053F1";
export const SECONDARY = "#20c997";
export const ACCENT = "#5e5c6c";

// available themes for folio
export const THEMES = {
    DEFAULT: "default",
};

export const STICKERS = {
    // SMILING_FACE: "smiling-face",
    SMILING_FACE_WITH_HEART_EYES: "smiling-face-with-heart-eyes",
    FACE_WITH_TEARS_OF_JOY: "face-with-tears-of-joy",
    CONFUSED_FACE: "confused-face",
    SMILING_FACE_WITH_SUNGLASES: "smiling-face-with-sunglases",
    ANGUISHED_FACE: "anguished-face",
    HEART: "heart",
    THUMBS_UP: "thumbs-up",
    THUMBS_DOWN: "thumbs-down",
};

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
    CROSSHAIR: "crosshair",
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

export const FORM_OPTIONS = {
    COLOR: "color",
    SELECT: "select",
    LABELED_SELECT: "labeled-select",
    COLOR_SELECT: "color-select",
    FONT: "font",
    RANGE: "range",
    CHECKBOX: "checkbox",
    PIXELS: "pixels",
    SEPARATOR: "separator",
    IMAGE_SELECT: "image-select",
    TEXT: "text",
    CUSTOM: "custom",
};

export const ELEMENTS = {
    SHAPE: "shape",
    LINE: "line",
    ARROW: "arrow",
    IMAGE: "image",
    TEXT: "text",
    DRAW: "draw",
    NOTE: "note",
    BOOKMARK: "bookmark",
    STICKER: "sticker",
};

export const SHAPES = {
    RECTANGLE: "rectangle",
    ELLIPSE: "ellipse",
    DIAMOND: "diamond",
    TRIANGLE: "triangle",
};

export const ARROW_SHAPES = {
    LINE: "line",
    CONNECTOR: "connector",
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
    FOLIO_LIB: "application/vnd.foliolib+json",
    JSON: "application/json",
    PNG: "image/png",
    JPG: "image/jpeg",
    SVG: "image/svg+xml",
};

export const FILE_EXTENSIONS = {
    FOLIO: ".folio",
    FOLIO_LIB: ".foliolib",
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

export const TEXT_SIZE_STEP = 2;
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
    ARROW_SHAPE: ARROW_SHAPES.LINE,
    ARROWHEAD_START: ARROWHEADS.NONE,
    ARROWHEAD_END: ARROWHEADS.ARROW,
    OPACITY: OPACITY_DEFAULT,
    NOTE_COLOR: STICKYNOTE_COLORS.yellow,
    STICKER: STICKERS.SMILING_FACE_WITH_HEART_EYES,
};

// Fields in elements
export const FIELDS = {
    ID: "id",
    TYPE: "type",
    NAME: "name",
    VERSION: "version",
    SELECTED: "selected",
    ERASED: "erased",
    CREATING: "creating",
    EDITING: "editing",
    GROUP: "group",
    X_START: "x1",
    X_END: "x2",
    Y_START: "y1",
    Y_END: "y2",
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
    ARROW_SHAPE: "arrowShape",
    START_ARROWHEAD: "startArrowhead",
    END_ARROWHEAD: "endArrowhead",
    OPACITY: "opacity",
    ORDER: "order",
    LOCKED: "locked",
    NOTE_COLOR: "noteColor",
    NOTE_TEXT: "noteText",
    ASSET_ID: "assetId",
    STICKER: "sticker",
    LIBRARY_ITEM_ID: "libraryItemId",
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
export const POINTER_SIZE = 5;
export const POINTER_DELAY = 1000;
export const POINTER_INTERVAL_DELAY = 50;
export const POINTER_TENSION = 0.5 * 12;

// Snap constants
export const SNAP_THRESHOLD = GRID_SIZE / 2;
export const SNAP_STROKE_COLOR = "#df2033";
export const SNAP_STROKE_WIDTH = 2;
export const SNAP_EDGE_X = "x";
export const SNAP_EDGE_Y = "y";

// Group constants
export const GROUP_BOUNDS_COLOR = PRIMARY;
export const GROUP_ACTIVE_BOUNDS_COLOR = ACCENT;

// Bookmark constants
export const BOOKMARK_WIDTH = 240;
export const BOOKMARK_HEIGHT = 200;
export const BOOKMARK_OFFSET = 25;

// Sticker constants
export const STICKER_WIDTH = 72;
export const STICKER_HEIGHT = 72;

// Assets types constants
export const ASSETS = {
    IMAGE: "image",
    BOOKMARK: "bookmark",
};

// snaps constans
export const SNAPS_STROKE_COLOR = "#E92F8C";
export const SNAPS_STROKE_WIDTH = 2;

// bounds constants
export const BOUNDS_STROKE_COLOR = PRIMARY;
export const BOUNDS_STROKE_WIDTH = 3;
export const BOUNDS_STROKE_DASH = 0;

// brush constants
export const BRUSH_FILL_COLOR = PRIMARY;
export const BRUSH_FILL_OPACITY = 0.3;
export const BRUSH_STROKE_COLOR = NONE;
export const BRUSH_STROKE_WIDTH = 0;
export const BRUSH_STROKE_DASH = 5;

// object dimensions constants
export const OBJECT_DIMENSIONS_FILL_COLOR = PRIMARY;
export const OBJECT_DIMENSIONS_TEXT_COLOR = WHITE;
export const OBJECT_DIMENSIONS_TEXT_SIZE = "0.625rem";

// handlers constants
export const HANDLERS_FILL_COLOR = WHITE;
export const HANDLERS_STROKE_COLOR = PRIMARY;

// screenshot constants
export const SCREENSHOT_STROKE_COLOR = PRIMARY;
export const SCREENSHOT_STROKE_WIDTH = 3;

// library constants
export const LIBRARY_THUMBNAIL_WIDTH = 50;
export const LIBRARY_THUMBNAIL_HEIGHT = 50;
export const LIBRARY_THUMBNAIL_BACKGROUND = WHITE;
// export const LIBRARY_SOURCES = {
//     IMPORTED_FROM_FILE: "imported:file",
// };

// preferences fields
export const PREFERENCES_FIELDS = {
    PAGES_VIEW: "pages.view",
};

// minimap constants
export const MINIMAP_WIDTH = 180;
export const MINIMAP_HEIGHT = 100;
export const MINIMAL_ELEMENT_FILL = "#ABABAB";
export const MINIMAP_ELEMENT_RADIUS = 3;
export const MINIMAP_VISIBLE_FILL = "#F3F4F5";
export const MINIMAP_VISIBLE_RADIUS = 8;
