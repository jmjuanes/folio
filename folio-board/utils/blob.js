// Create a new blob object
export const createBlob = (content, type) => {
    return new Blob([content], {type: type});
};

// Create a blob from a file object
export const blobFromFile = (file, type) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const blob = new Blob([new Uint8Array(reader.result)], {
                type: type || file.type,
            });
            resolve(blob);
        });
        reader.addEventListener("error", e => reject(e));
        reader.readAsArrayBuffer(file);
    });
};

// Convert a blob to file
// export const blobToFile = (blob, name, type) => {
export const blobToFile = (blob, filename) => {
    // return new Promise(resolve => {
    //     return resolve(new File([blob], name, {type: type || blob.type}));
    // });
    return new Promise(resolve => {
        const linkElement = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        linkElement.href = url;
        linkElement.download = filename;
        linkElement.click();
        window.URL.revokeObjectURL(url);
        return resolve(true);
    });
};

// Save Blob to clopboard
// Based on https://stackoverflow.com/a/57546936
export const blobToClipboard = blob => {
    return navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob,
        }),
    ]);
};

// Convert Blob to DataURL
export const blobToDataUrl = blob => {
    return new Promise(resolve => {
        const file = new FileReader();
        file.onload = event => {
            return resolve(event.target.result);
        };
        return file.readAsDataURL(blob);
    });
};
