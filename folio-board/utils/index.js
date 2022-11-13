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

// Measure text size
export const measureText = (text, textSize, textFont) => {
    const size = {width: 0, height: 0}; // To store the computed text size
    if (text.length > 0) {
        if (!measureText.div) {
            measureText.div = document.createElement("div");
            measureText.div.style.position = "absolute";
            measureText.div.style.visibility = "hidden";
            measureText.div.style.top = "-9999px";
            measureText.div.style.left = "-9999px";
            measureText.div.style.lineHeight = "normal"; // Set line-height as normal
            measureText.div.style.whiteSpace = "pre";
            document.body.appendChild(measureText.div);
        }
        measureText.div.innerHTML = text.replace(/\r\n?/g, "\n").split("\n").join("<br>");
        measureText.div.style.fontFamily = textFont;
        measureText.div.style.fontSize = textSize + "px";
        size.width = measureText.div.offsetWidth; // Set computed width
        size.height = measureText.div.offsetHeight; // Set computed height
        // document.body.removeChild(div); // Remove div from DOM
    }
    // Return the text size
    return size;
};

