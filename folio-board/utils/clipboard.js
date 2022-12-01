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
        const items = event?.clipboardData?.items || [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i]; // Get current item
            if (item.type.indexOf("image") !== -1) {
                return blobToDataUrl(item.getAsFile()).then(content => {
                    // return resolve({type: "image", blob: item.getAsFile()});
                    return resolve({
                        type: "image",
                        content: content, // item.getAsFile(),
                    });
                });
            }
            else if (item.type.indexOf("text") !== -1) {
                return item.getAsString(data => {
                    return resolve({
                        type: "text",
                        content: data.trim(),
                    });
                });
            }
        }
    });
};
