// Global colors
export const TRANSPARENT = "transparent";
export const WHITE = "#fff";
export const BLACK = "#000";

export const COLOR_NAMES = {
    RED: "red",
    ORANGE: "orange",
    YELLOW: "yellow",
    GREEN: "green",
    MINT: "mint",
    AQUA: "aqua",
    BLUE: "blue",
    PURPLE: "purple",
    PINK: "pink",
};

export const DEFAULT_FILL_COLOR_SHADE = 1;
export const DEFAULT_STROKE_COLOR_SHADE = 4;
export const DEFAULT_TEXT_COLOR_SHADE = 4;

const colorsFromList = list => {
    return list.split("-").map(color => "#" + color);
};

// Global colors
export const COLORS = {
    [COLOR_NAMES.RED]: colorsFromList("f68888-f36565-f04242-e22a2a-d41111"),
    [COLOR_NAMES.ORANGE]: colorsFromList("fba183-fa855e-f96939-ec5320-df3d07"),
    [COLOR_NAMES.YELLOW]: colorsFromList("fbd784-facb5f-f9bf39-ecaf20-df9e07"),
    [COLOR_NAMES.GREEN]: colorsFromList("acd98c-98d070-83c653-70b043-5d9933"),
    [COLOR_NAMES.MINT]: colorsFromList("86dfc9-68d7bc-4acfae-3bb899-2ba184"),
    [COLOR_NAMES.AQUA]: colorsFromList("8cdcf2-6ad2ef-47c7eb-2fb7dd-17a7cf"),
    [COLOR_NAMES.BLUE]: colorsFromList("8fbaf0-6da6ec-4a91e8-327eda-1a6acb"),
    [COLOR_NAMES.PURPLE]: colorsFromList("cdbff3-b49fed-9a7ee7-815ee1-673ddb"),
    [COLOR_NAMES.PINK]: colorsFromList("f0a8d3-ea88c3-e467b2-df47a2-d92691"),
};

// Generate a color palette from specified color shade
const generateColorPalette = shade => {
    const specificColors = Object.keys(COLORS).map(color => {
        return COLORS[color][shade];
    });
    // Append white and black colors
    return [WHITE, BLACK, ...specificColors];
};

// Default color palettes
export const DEFAULT_FILL_COLOR_PALETTE = generateColorPalette(DEFAULT_FILL_COLOR_SHADE);
export const DEFAULT_STROKE_COLOR_PALETTE = generateColorPalette(DEFAULT_STROKE_COLOR_SHADE);
export const DEFAULT_TEXT_COLOR_PALETTE = generateColorPalette(DEFAULT_TEXT_COLOR_SHADE);


