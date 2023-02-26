import {EXPORT_FORMATS, FILE_EXTENSIONS} from "./constants.js";
import {getRectangleBounds} from "./math.js";

// Convert a blob to file
const blobToFile = (blob, filename) => {
    return new Promise(resolve => {
        const linkElement = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        linkElement.href = url;
        linkElement.download = filename;
        linkElement.click();
        window.URL.revokeObjectURL(url);
        return resolve(filename);
    });
};

// Save Blob to clopboard
// Based on https://stackoverflow.com/a/57546936
const blobToClipboard = blob => {
    return navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob,
        }),
    ]);
};

// Convert blob to dataurl
const blobToDataUrl = blob => {
    return new Promise(resolve => {
        const file = new FileReader();
        file.onload = event => {
            return resolve(event.target.result);
        };
        return file.readAsDataURL(blob);
    });
};

// Get image in SVG
const getSvgImage = options => {
    const elements = options?.elements || [];
    return new Promise(resolve => {
        const bounds = getRectangleBounds(elements);
        // 1. Create a new SVG element
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        // 2. Set new svg attributes
        svg.setAttribute("style", ""); // Reset style
        svg.setAttribute("width", Math.abs(bounds.x2 - bounds.x1));
        svg.setAttribute("height", Math.abs(bounds.y2 - bounds.y1));
        // 3. Set svg style
        svg.style.backgroundColor = options?.background || "#fff";
        // 4. Set internal styles
        if (options?.fonts && options.fonts?.length > 0) {
            const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
            const styleContent = (options.fonts || [])
                .map(font => `@import url('${font}');`)
                .join("\n");
            styleElement.textContent = styleContent;
            svg.appendChild(styleElement);
        }
        // 5. Set group attributes
        group.setAttribute("transform", `translate(-${bounds.x1} -${bounds.y1})`);
        svg.appendChild(group);
        // 6. Append elements into new SVG
        elements.forEach(element => {
            const nodeElement = document.querySelector(`g[data-element="${element.id}"]`);
            if (nodeElement) {
                group.appendChild(nodeElement.cloneNode(true));
            }
        });
        // 6. return SVG
        const content = (new XMLSerializer()).serializeToString(svg);
        return resolve(new Blob([content], {
            type: "image/svg+xml;charset=utf-8",
        }));
    });
};

// Get image in PNG format
const getPngImage = options => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const img = new Image();
        // img.setAttribute("crossorigin", "anonymous");
        // img.crossOrigin = "anonymous";
        img.addEventListener("load", () => {
            let x = 0, y = 0;
            if (options.crop) {
                const bounds = getRectangleBounds(options.elements);
                x = bounds.x1 - Math.min(options.crop.x1, options.crop.x2);
                y = bounds.y1 - Math.min(options.crop.y1, options.crop.y2);
                canvas.width = Math.abs(options.crop.x2 - options.crop.x1);
                canvas.height = Math.abs(options.crop.y2 - options.crop.y1);
            }
            else {
                // Set the canvas size to the total image size
                canvas.width = img.width;
                canvas.height = img.height;
            }
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y);
            canvas.toBlob(resolve);
        });
        img.addEventListener("error", event => {
            return reject(event);
        });
        // Load image
        getSvgImage(options)
            .then(data => blobToDataUrl(data))
            .then(data => img.src = data);
    });
};

// Export to blob image
export const exportToBlob = options => {
    // TODO: throw an error if no elements list are provided
    // Generate SVG image
    if (options?.format === EXPORT_FORMATS.SVG) {
        if (options?.crop) {
            return Promise.reject(new Error("Can not crop a SVG export"));
        }
        return getSvgImage(options);
    }
    // Fallback: generate PNG image
    return getPngImage(options)
};

// Export image to clipboard
export const exportToClipboard = options => {
    return exportToBlob(options).then(imageBlob => {
        return blobToClipboard(imageBlob);
    });
};

// Export image to file
export const exportToFile = options => {
    return exportToBlob(options).then(imageBlob => {
        const name = options?.filename || "untitled";
        const extension = FILE_EXTENSIONS[options?.format] || FILE_EXTENSIONS.PNG;
        return blobToFile(imageBlob, `${name}${extension}`);
    });
};
