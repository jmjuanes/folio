import {
    COLOR_KEYS,
    SIZE_KEYS,
    FONT_KEYS,
    OPACITY_INITIAL,
    STROKES,
} from "./constants.js";

export const strokeColors = {
    [COLOR_KEYS.NONE]: "transparent",
    [COLOR_KEYS.WHITE]: "rgb(255,255,255)",
    [COLOR_KEYS.GRAY]: "rgb(66,72,82)", 
    [COLOR_KEYS.BLACK]: "rgb(0,0,0)",
    [COLOR_KEYS.BLUE]: "rgb(74,136,218)",
    [COLOR_KEYS.GREEN]: "rgb(137, 192, 84)",
    [COLOR_KEYS.PURPLE]: "rgb(149, 121, 218)",
    [COLOR_KEYS.PINK]: "rgb(213, 111, 172)",
    [COLOR_KEYS.YELLOW]: "rgb(245, 185, 69)",
    [COLOR_KEYS.RED]: "rgb(232, 85, 62)",
};

export const fillColors = {
    [COLOR_KEYS.NONE]: "transparent",
    [COLOR_KEYS.WHITE]: "rgb(255,255,255)",
    [COLOR_KEYS.GRAY]: "rgb(169, 176, 187)",
    [COLOR_KEYS.BLACK]: "rgb(0,0,0)",
    [COLOR_KEYS.BLUE]: "rgb(115, 176, 244)",
    [COLOR_KEYS.GREEN]: "rgb(180, 223, 128)",
    [COLOR_KEYS.PURPLE]: "rgb(179, 164, 238)",
    [COLOR_KEYS.PINK]: "rgb(241, 153, 206)",
    [COLOR_KEYS.YELLOW]: "rgb(250, 210, 119)",
    [COLOR_KEYS.RED]: "rgb(246, 131, 111)",
};

export const strokeWidths = {
    [SIZE_KEYS.SMALL]: 2,
    [SIZE_KEYS.MEDIUM]: 4,
    [SIZE_KEYS.LARGE]: 8,
    [SIZE_KEYS.XLARGE]: 16,
};

export const fontSizes = {
    [SIZE_KEYS.SMALL]: 12,
    [SIZE_KEYS.MEDIUM]: 16,
    [SIZE_KEYS.LARGE]: 32,
    [SIZE_KEYS.XLARGE]: 64,
};

export const fontFaces = {
    [FONT_KEYS.SANS]: "Noto Sans, sans-serif",
    [FONT_KEYS.SERIF]: "Noto Serif, serif",
    [FONT_KEYS.DRAW]: "Caveat Brush, cursive",
    [FONT_KEYS.MONO]: "monospace",
};

export const defaultStyles = {
    fillColor: COLOR_KEYS.NONE,
    fillOpacity: OPACITY_INITIAL,
    strokeColor: COLOR_KEYS.BLACK,
    strokeWidth: SIZE_KEYS.MEDIUM,
    strokeOpacity: OPACITY_INITIAL,
    strokeStyle: STROKES.SOLID,
    textFont: FONT_KEYS.SANS,
    textSize: SIZE_KEYS.MEDIUM,
    textColor: COLOR_KEYS.BLACK,
};
