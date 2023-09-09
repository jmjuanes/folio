export const DEFAULT_FILL_COLOR_SHADE = 1;
export const DEFAULT_STROKE_COLOR_SHADE = 3;
export const DEFAULT_TEXT_COLOR_SHADE = 4;

// Check if the provided color is a valid hex color
export const isValidHexColor = value => {
    return value && value.startsWith("#") && (value.length === 4 || value.length === 7 || value.length === 9);
};

// Generate a darker or lighten version of the specified color
export const colorShade = (color, amount) => {
    return "#" + color.replace(/^#/, "").replace(/../g, color => {
        return Math.max(Math.min(255, parseInt(color, 16) + amount), 0).toString(16).padStart(2, "0");
    });
};

const colorsFromList = list => {
    return list.split("-").map(color => "#" + color);
};

// Global colors
export const COLORS = {
    // Basic colors
    white: "#ffffff",
    black: "#000000",
    // Colors with shades
    gray: colorsFromList("e2e6e9-b7bdc1-8c9499-616b71-364149"),
    cyan: colorsFromList("8cdcf2-6ad2ef-47c7eb-2fb7dd-17a7cf"),
    blue: colorsFromList("8fbaf0-6da6ec-4a91e8-327eda-1a6acb"),
    purple: colorsFromList("cdbff3-b49fed-9a7ee7-815ee1-673ddb"),
    pink: colorsFromList("f0a8d3-ea88c3-e467b2-df47a2-d92691"),
    teal: colorsFromList("86dfc9-68d7bc-4acfae-3bb899-2ba184"),
    green: colorsFromList("acd98c-98d070-83c653-70b043-5d9933"),
    yellow: colorsFromList("fbd784-facb5f-f9bf39-ecaf20-df9e07"),
    orange: colorsFromList("fba183-fa855e-f96939-ec5320-df3d07"),
    red: colorsFromList("f68888-f36565-f04242-e22a2a-d41111"),
};

// Special colors for note elements
export const STICKYNOTE_COLORS = {
    yellow: "#f5d22b",
    orange: "#ff9e4a",
    green: "#cbdf58",
    blue: "#a7cdf5",
    pink: "#ea95bc",
    violet: "#c7a3d3",
};

// Special colors for background
export const BACKGROUND_COLORS = {
    white: "#ffffff",
    gray: "#fafafa",
    blue: "#e9f4fb",
    green: "#eafaf1",
    yellow: "#fef9e7",
    red: "#fceae8",
};

// Pick a color from the color palette
export const pickColor = (name, shade = 0) => {
    return (Array.isArray(COLORS[name]) ? COLORS[name][shade] : COLORS[name]) || COLORS.black;
};

// Generate a color palette from specified color shade
const generateColorPalette = shade => {
    return Object.keys(COLORS).map(colorName => {
        return pickColor(colorName, shade);
    });
};

const generateColorPick = shade => {
    return ["black", "blue", "green", "yellow", "red"].map(color => {
        return pickColor(color, shade);
    });
};

// Default color palettes
export const FILL_COLOR_PALETTE = generateColorPalette(DEFAULT_FILL_COLOR_SHADE);
export const STROKE_COLOR_PALETTE = generateColorPalette(DEFAULT_STROKE_COLOR_SHADE);
export const TEXT_COLOR_PALETTE = generateColorPalette(DEFAULT_TEXT_COLOR_SHADE);

// Default quick picks
export const FILL_COLOR_PICK = generateColorPick(DEFAULT_FILL_COLOR_SHADE);
export const STROKE_COLOR_PICK = generateColorPick(DEFAULT_STROKE_COLOR_SHADE);
export const TEXT_COLOR_PICK = generateColorPick(DEFAULT_TEXT_COLOR_SHADE);

// Background color palette
export const BACKGROUND_COLOR_PALETTE = Object.values(BACKGROUND_COLORS);

// Sticky note color palette
export const NOTE_COLOR_PALETTE = Object.values(STICKYNOTE_COLORS);
export const NOTE_COlOR_PICK = Object.values(STICKYNOTE_COLORS);
