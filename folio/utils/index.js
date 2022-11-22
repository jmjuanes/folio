import {KEYS} from "../constants.js";

// Generate an ID
// Source: https://michalzalecki.com/generate-unique-id-in-the-browser-without-a-library/ 
export const generateID = () => {
    return (window.crypto.getRandomValues(new Uint32Array(1))[0]).toString(16);
};

// Check for arrow keys
export const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};

// Check if the provided event.target is related to an input element
export const isInputTarget = e => {
    return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
};

