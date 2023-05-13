import {NONE, PRIMARY, SECONDARY, ACCENT} from "folio-core";

export const IS_DARWIN = !!(/Mac|iPod|iPhone|iPad/.test(window.navigator.platform));

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

export const THEMES = {
    LIGHT: "light",
    DARK: "dark",
};

export const ACTIONS = {
    MOVE: "action:move",
    SELECT: "action:select",
    SCREENSHOT: "action:screenshot",
    CREATE: "action:create",
    TRANSLATE: "action:translate",
    RESIZE: "actionresize",
    EDIT: "action:edit",
    ERASE: "action:erase",
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

// Screenshot brush constants
export const SCREENSHOT_FILL_COLOR = SECONDARY;
export const SCREENSHOT_STROKE_COLOR = SECONDARY;

// Select bounds constants
export const SELECT_BOUNDS_FILL_COLOR = NONE;
export const SELECT_BOUNDS_STROKE_COLOR = PRIMARY;

// Group bounds constants
export const GROUP_BOUNDS_FILL_COLOR = NONE;
export const GROUP_BOUNDS_STROKE_COLOR = PRIMARY;
export const GROUP_BOUNDS_STROKE_DASHARRAY = 5;

// Active group bounds constants
export const ACTIVE_GROUP_BOUNDS_STROKE_COLOR = ACCENT;
