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

// Get text from clipboard
export const getTextFromClipboard = () => {
    if (navigator?.clipboard) {
        return navigator.clipboard.readText();
    }
    // TODO: use an alternate method to read from clipboard
    return Promise.reject(null);
};

export const getTextFromClipboardItem = item => {
    return new Promise(resolve => {
        return item.getAsString(text => resolve(text.trim()));
    });
};

export const getBlobFromClipboardItem = item => {
    return blobToDataUrl(item.getAsFile());
};
