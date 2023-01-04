import {COLORS, SIZES, FONTS} from "folio-core";

export const strokeColors = {
    [COLORS.NONE]: "transparent",
    [COLORS.WHITE]: "rgb(255,255,255)",
    [COLORS.GRAY]: "rgb(66,72,82)", 
    [COLORS.BLACK]: "rgb(0,0,0)",
    [COLORS.BLUE]: "rgb(74,136,218)",
    [COLORS.GREEN]: "rgb(137, 192, 84)",
    [COLORS.PURPLE]: "rgb(149, 121, 218)",
    [COLORS.PINK]: "rgb(213, 111, 172)",
    [COLORS.YELLOW]: "rgb(245, 185, 69)",
    [COLORS.RED]: "rgb(232, 85, 62)",
};

export const fillColors = {
    [COLORS.NONE]: "transparent",
    [COLORS.WHITE]: "rgb(255,255,255)",
    [COLORS.GRAY]: "rgb(169, 176, 187)",
    [COLORS.BLACK]: "rgb(0,0,0)",
    [COLORS.BLUE]: "rgb(115, 176, 244)",
    [COLORS.GREEN]: "rgb(180, 223, 128)",
    [COLORS.PURPLE]: "rgb(179, 164, 238)",
    [COLORS.PINK]: "rgb(241, 153, 206)",
    [COLORS.YELLOW]: "rgb(250, 210, 119)",
    [COLORS.RED]: "rgb(246, 131, 111)",
};

export const strokeWidths = {
    [SIZES.SMALL]: 2,
    [SIZES.MEDIUM]: 4,
    [SIZES.LARGE]: 8,
    [SIZES.XLARGE]: 16,
};

export const fontSizes = {
    [SIZES.SMALL]: 12,
    [SIZES.MEDIUM]: 16,
    [SIZES.LARGE]: 32,
    [SIZES.XLARGE]: 64,
};

export const fontFaces = {
    [FONTS.SANS]: "Noto Sans, sans-serif",
    [FONTS.SERIF]: "Noto Serif, serif",
    [FONTS.DRAW]: "Caveat Brush, cursive",
    [FONTS.MONO]: "monospace",
};

export const boardStyles = {
    fillColors: fillColors,
    strokeColors: strokeColors,
    strokeWidths: strokeWidths,
    fontSizes: fontSizes,
    fontFaces: fontFaces,
    textColors: strokeColors,
};
