import {blobToDataUrl} from "./blob.js";

// Copy blob to clipboard
export const copyBlobToClipboard = blob => {
    if (navigator?.clipboard) {
        return navigator.clipboard.write([
            new ClipboardItem({[blob.type]: blob}),
        ]);
    }
    // TODO: use an alternate method to copy to clipboard
    return Promise.resolve(false);
};

// Copy text to clipboard
export const copyTextToClipboard = text => {
    if (navigator?.clipboard) {
        return navigator.clipboard.writeText(text);
    }
    // TODO: use an alternate method to copy to clipboard
    return Promise.reject(null);
};

// @description get clipboard contents
export const getClipboardContents = (event = null) => {
    // check if a custom event has been provided
    if (event && event?.clipboardData) {
        return Promise.resolve(event.clipboardData?.items || []);
    }
    // get from navigator
    if (navigator?.clipboard) {
        return navigator.clipboard.read();
    }
    // other case: return empty array
    return Promise.resolve([]);
};
