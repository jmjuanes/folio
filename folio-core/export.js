import {getRectangleBounds} from "./math.js";

// Create a new blob object
const createBlob = (content, type) => {
    return new Blob([content], {type: type});
};

// Convert a blob to file
const blobToFile = (blob, filename) => {
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
const blobToClipboard = blob => {
    return navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob,
        }),
    ]);
};

// Get image in SVG
export const exportToSvg = options => {
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
        // 4. Set svg fonts
        // TODO
        // 5. Set group attributes
        group.setAttribute("transform", `translate(${bounds.x1} ${bounds.y1})`);
        svg.appendChild(group);
        // 6. Append elements into new SVG
        elements.forEach(element => {
            const nodeElement = document.querySelector(`g[data-element="${element.id}"]`);
            if (nodeElement) {
                group.appendChild(nodeElement.cloneNode(true));
            }
        });
        // 6. return SVG
        const svgString = (new XMLSerializer()).serializeToString(svg);
        const svgBlob = createBlob(svgString, "image/svg+xml;charset=utf-8");
        return resolve(svgBlob);
    });
};

// Export to blob image
export const exportToBlob = options => {
    return new Promise((resolve, reject) => {
        // Initialize canvas to render SVG image
        const canvas = document.createElement("canvas");
        // Initialize image
        const img = new Image();
        img.addEventListener("load", () => {
            const x = (-1) * (options?.x || 0);
            const y = (-1) * (options?.y || 0);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, x, y);
            // return resolve(canvas.toDataURL("image/png"));
            canvas.toBlob(resolve);
        });
        img.addEventListener("error", event => {
            return reject(event);
        });
        // Load image
        exportToSvg(options).then(svgBlob => {
            canvas.width = options?.width || img.width;
            canvas.height = options?.height || img.height;
            img.src = window.URL.createObjectURL(svgBlob);
        });
    });
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
        return blobToFile(imageBlob, options?.filename || "export.png");
    });
};
