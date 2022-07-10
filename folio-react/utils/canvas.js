// Create a temporal canvas element
export const createCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

// Clear the canvas element
export const clearCanvas = canvas => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
};

// Generate a screenshot of the provided canvas and the specified region
// https://stackoverflow.com/a/13074780
export const screenshotCanvas = (originalCanvas, region) => {
    return new Promise(resolve => {
        if (!region) {
            return originalCanvas.toBlob(blob => resolve(blob));
        }
        // Get screenshot
        const originalContext = originalCanvas.getContext("2d");
        const image = originalContext.getImageData(region.x || 0, region.y || 0, region.width, region.height);
    
        // Create a new canvas to draw the screenshot
        const canvas = createCanvas(region.width, region.height); // New canvas
        const context = canvas.getContext("2d");
        context.putImageData(image, 0, 0);

        return canvas.toBlob(blob => resolve(blob));
    });
};
