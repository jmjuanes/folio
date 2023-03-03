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
    return Promise.resolve(false);
};

// Get pasted items
export const getDataFromClipboard = event => {
    return new Promise(resolve => {
        const clipboardItems = event?.clipboardData?.items || [];
        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i];
            // Check for image data (image/png, image/jpg)
            if (item.type.startsWith("image/")) {
                const blob = item.getAsFile();
                return blobToDataUrl(blob).then(content => {
                    return resolve(["image", content]);
                });
            }
            // Check for text data
            else if (item.type === "text/plain") {
                return item.getAsString(text => {
                    return resolve(["text", text.trim()]);
                });
            }
        }
    });
};
