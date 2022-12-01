// Clean SVG using el.cloneNode
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode 
const exportSvg = (svg, width, height) => {
    // 1. Create a new SVG element
    const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // 2. Set new svg attributes
    // newSvg.setAttribute("style", ""); // Reset style
    newSvg.setAttribute("width", width + "px");
    newSvg.setAttribute("height", height + "px");

    // 3. Append elements into new SVG
    Array.from(svg.querySelectorAll("g[data-element-id")).forEach(element => {
        newSvg.appendChild(element.cloneNode(true));
    });

    // 4. return new SVG
    return newSvg;
};

// Export Folio SVG object to PNG
export const toImagePNG = (svg, width, height, options) => {
    const DOMURL = window?.URL || window?.webkitURL || window;
    return new Promise((resolve, reject) => {
        const clonedSvg = exportSvg(svg, width, height, options);
        const svgString = (new XMLSerializer()).serializeToString(clonedSvg);
        const svgBlob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8",
        });

        // Initialize canvas to render SVG image
        const canvas = document.createElement("canvas");
        canvas.width = options?.region?.width || width;
        canvas.height = options?.region?.height || height;

        // Initialize image
        const img = new Image();
        img.addEventListener("load", () => {
            const x = (-1) * (options?.region?.x || 0);
            const y = (-1) * (options?.region?.y || 0);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, x, y);
            // return resolve(canvas.toDataURL("image/png"));
            canvas.toBlob(resolve);
        });
        img.addEventListener("error", event => {
            return reject(event);
        });

        // Load image
        img.src = DOMURL.createObjectURL(svgBlob);
    });
};
