import {KEYS, KEY_CODES} from "../constants.js";

// Check for arrow keys
export const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};

// @description get the corresponding key from the provided key code
// @param {string} keyCode - key code
// @returns {string} - key
export const getKeyFromKeyCode = keyCode => {
    return Object.keys(KEY_CODES).find(key => KEY_CODES[key] === keyCode) || "";
};
