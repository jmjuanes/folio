import {blobToDataUrl} from "./blob.js";

// Get pasted items
export const getDataFromClipboard = event => {
    return new Promise(resolve => {
        const items = event?.clipboardData?.items || [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i]; // Get current item
            if (item.type.indexOf("image") !== -1) {
                return resolve({type: "image", blob: item.getAsFile()});
            }
            else if (item.type.indexOf("text") !== -1) {
                return item.getAsString(content => {
                    return resolve({type: "text", blob: content});
                });
            }
        }
    });
};

// Parse clipboard data
export const parseClipboardBlob = (type, blob) => {
    if (type === "text") {
        return Promise.resolve(blob.trim());
    }
    // Convert blob to dataURL
    return blobToDataUrl(blob);
};

// Copy text to clipboard
export const copyTextToClipboard = text => {
    return navigator.clipboard.writeText(text);
};
