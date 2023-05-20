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

// Form option types
export const FORM_OPTIONS = {
    COLOR: "color",
    SELECT: "select",
    FONT: "font",
    RANGE: "range",
    CHECKBOX: "checkbox",
    PIXELS: "pixels",
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
