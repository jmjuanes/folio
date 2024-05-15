// Check if the provided color is a valid hex color
export const isValidHexColor = value => {
    return value && value.startsWith("#") && (value.length === 4 || value.length === 7 || value.length === 9);
};
