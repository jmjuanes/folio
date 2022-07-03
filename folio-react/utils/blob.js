// Save Blob to file
// Based on https://stackoverflow.com/a/19328891
export const blobToFile = (blob, name) => {
    // Create the link element to download the file
    const link = document.createElement("a");
    link.style.display = "none"; // Hide link element
    document.body.appendChild(link); // Append to body
    // let blob = new Blob([content], {
    //     "type": type
    // });
    const url = window.URL.createObjectURL(blob); // Create url
    link.href = url; // Set the link url as the generated url
    link.download = name; // Set the filename
    link.click(); // Download the file
    window.URL.revokeObjectURL(url); // Revoke url
    document.body.removeChild(link); // Remove from body
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

