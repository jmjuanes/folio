import {KEYS} from "../constants.js";

export * from "./blob.js";
export * from "./clipboard.js";
export * from "./events.js";
export * from "./image.js";
export * from "./math.js";

// Generate an ID
// Source: https://michalzalecki.com/generate-unique-id-in-the-browser-without-a-library/ 
export const generateID = () => {
    return (window.crypto.getRandomValues(new Uint32Array(1))[0]).toString(16);
};

// Format the specified date to get yyyy-mm-dd
export const formatDate = date => {
    const d = new Date(date || Date.now());
    const year = d.getFullYear();
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();

    if (month.length < 2) {
        month = "0" + month;
    }
    if (day.length < 2) {
        day = "0" + day;
    }

    return [year, month, day].join("-");
};

// Check for arrow keys
export const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};
