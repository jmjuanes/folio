// Check if the provided color is a valid hex color
export const isValidHexColor = value => {
    return value && value.startsWith("#") && (value.length === 4 || value.length === 7 || value.length === 9);
};

// Tiny utility to check if a value is active
export const checkIsActive = (value, currentValue, isActiveFn, data) => {
    if (typeof isActiveFn === "function") {
        return isActiveFn(value, currentValue, data);
    }
    // Other case, just check if value is the current value
    return value === currentValue;
};

// Tiny utility to check if a value is visible
export const checkIsVisible = (value, currentValue, isVisibleFn, data) => {
    if (typeof isVisibleFn === "function") {
        return !!isVisibleFn(value, currentValue, data);
    }
    // By default, item is visible
    return true;
};
