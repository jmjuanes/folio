// Convert a RGB string color to HEX string color
export const rgbToHex = str => {
    if (str === "transparent") {
        return str;
    }
    return "#" + str.match(/\d+/g).map(x => (+x).toString(16).padStart(2,"0")).join("").substring(0, 7);
};

// Convert a HEX string color to RGB string color
export const hexToRgb = str => {
    if (str === "transparent") {
        return str;
    }
    // return "rgb(" + str.match(/\w\w/g).map(x => parseInt(x, 16)).join(",") + ")";
    const items = str
        .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => "" + r + r + g + g + b + b)
        .match(/.{2}/g)
        .map(x => parseInt(x, 16));
    return "rgb(" + items.join(",") + ")";
};

// Check if the provided value is a valid hex color
// TODO: check for valid HEX digits
export const isValidHexColor = str => {
    return str === "transparent" || str.length === 3 || str.length === 6;
};

// Color parser
export const parseColor = (color, opacity) => {
    if (color === "transparent") {
        return color; // Nothing to do if color is transparent
    }
    // Get RGB values from color and return the RGBA color
    return `rgba(${color.match(/\d+/g).slice(0, 3).join(",")},${opacity})`;
};
