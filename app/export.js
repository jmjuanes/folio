import {fileSave} from "browser-fs-access";
import {
    EXPORT_FORMATS,
    EXPORT_OFFSET,
    EXPORT_PADDING,
    TRANSPARENT,
    FILE_EXTENSIONS,
    FONT_SOURCES,
} from "./constants.js";
import {getRectangleBounds} from "./utils/math.js";
import {exportElementSvg, getElementConfig} from "./elements.js";

// Append a new DOM node element
const appendChildNode = (parent, newNode) => {
    if (newNode) {
        parent.appendChild(newNode);
    }
};

// Convert a blob to file
const blobToFile = (blob, filename) => {
    return fileSave(blob, {
        description: "Folio Export",
        fileName: filename,
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

const importFontsFromCss = cssText => {
    const output = {
        css: cssText,
    };
    const fontFilesToImport = cssText.match(/https:\/\/[^)]+/g);
    const fontFilesPromises = fontFilesToImport.map(fileUrl => {
        return fetch(fileUrl)
            .then(response => response.blob())
            .then(blob => blobToDataUrl(blob))
            .then(data => {
                output.css = output.css.replace(fileUrl, data);
                return true;
            });
    });
    return Promise.all(fontFilesPromises)
        .then(() => output.css);
};

const getFonts = (fonts, embedFonts) => {
    if (!embedFonts) {
        const fontsImports = fonts.map(font => `@import url('${font}');`);
        return Promise.resolve(fontsImports.join("\n"))
    }
    const fontsPromises = fonts.map(fontUrl => {
        return fetch(fontUrl)
            .then(response => response.text())
            .then(cssText => importFontsFromCss(cssText))
    });
    return Promise.all(fontsPromises)
        .then(result => result.join("\n"));
};

// Get image in SVG
const getSvgImage = (elements = [], options = {}) => {
    const padding = options?.padding ?? EXPORT_PADDING;
    const fonts = options?.fonts || Object.values(FONT_SOURCES);
    return getFonts(fonts, !!options.embedFonts).then(fontsCss => {
        const bounds = getRectangleBounds(elements.map(el => {
            const elementConfig = getElementConfig(el);
            if (typeof elementConfig.getBoundingRectangle === "function") {
                return elementConfig.getBoundingRectangle(el);
            }
            return el;
        }));
        // 1. Create a new SVG element
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.appendChild(style);
        svg.appendChild(defs);
        svg.appendChild(group);
        // 2. Set new svg attributes
        svg.setAttribute("style", ""); // Reset style
        svg.setAttribute("width", Math.abs(bounds.x2 - bounds.x1) + 2 * padding);
        svg.setAttribute("height", Math.abs(bounds.y2 - bounds.y1) + 2 * padding);
        // 3. Set svg style
        svg.style.backgroundColor = options?.background || "#fff";
        // 4. Set internal styles
        style.textContent = fontsCss;
        // 5. Set group attributes
        group.setAttribute("transform", `translate(${padding - bounds.x1} ${padding - bounds.y1})`);
        // 6. Append elements into  group
        elements.forEach(element => {
            appendChildNode(group, exportElementSvg(element));
        });
        // 7. return SVG
        const content = (new XMLSerializer()).serializeToString(svg);
        return new Blob([content], {
            type: "image/svg+xml;charset=utf-8",
        });
    });
};

// Get image in PNG format
const getPngImage = (elements = [], options = {}) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const img = new Image();
        // img.setAttribute("crossorigin", "anonymous");
        // img.crossOrigin = "anonymous";
        img.addEventListener("load", () => {
            let x = 0, y = 0;
            const padding = (options.padding ?? EXPORT_PADDING) + EXPORT_OFFSET;
            // 1. We have selected a region to crop
            if (options.crop) {
                const bounds = getRectangleBounds(elements);
                x = bounds.x1 - Math.min(options.crop.x1, options.crop.x2) - padding;
                y = bounds.y1 - Math.min(options.crop.y1, options.crop.y2) - padding;
                canvas.width = Math.abs(options.crop.x2 - options.crop.x1);
                canvas.height = Math.abs(options.crop.y2 - options.crop.y1);
            }
            // 2. We have provided a custom size for the image
            else if (options.width || options.height) {
                canvas.width = options.width ?? options.height;
                canvas.height = options.height ?? options.width;
            }
            // 3. Use the size of the image
            else {
                canvas.width = img.width;
                canvas.height = img.height;
            }
            const ctx = canvas.getContext("2d");
            if (options.background !== TRANSPARENT) {
                ctx.fillStyle = options.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            // 1. We have a custom size for the output image
            if (options.width || options.height) {
                const cw = options.width ?? options.height, ch = options.height ?? options.width;
                const d = img.height / img.width;
                const w = (img.height > img.width) ? (ch / d) : cw;
                const h = (img.height > img.width) ? ch : (cw * d);
                ctx.drawImage(img, x + ((cw - w) / 2), y + ((ch - h) / 2), w, h);
            }
            // 2. Maintain the current image size
            else {
                ctx.drawImage(img, x, y);
            }
            canvas.toBlob(resolve);
        });
        img.addEventListener("error", event => {
            return reject(event);
        });
        // Load image
        getSvgImage(elements, options)
            .then(data => blobToDataUrl(data))
            .then(data => img.src = data);
    });
};

// Export to blob image
export const exportToBlob = (elements, options) => {
    // TODO: throw an error if no elements list are provided
    // Generate SVG image
    if (options?.format === EXPORT_FORMATS.SVG) {
        if (options?.crop) {
            return Promise.reject(new Error("Can not crop a SVG export"));
        }
        return getSvgImage(elements, {
            embedFonts: false,
            ...options,
        });
    }
    // Fallback: generate PNG image
    return getPngImage(elements, {
        embedFonts: true,
        ...options,
    })
};

// Export image to DataURL
export const exportToDataURL = (elements, options) => {
    return exportToBlob(elements, options).then(blob => blobToDataUrl(blob));
};

// Export image to clipboard
export const exportToClipboard = (elements, options) => {
    return exportToBlob(elements, options).then(imageBlob => {
        return blobToClipboard(imageBlob);
    });
};

// Export image to file
export const exportToFile = (elements, options) => {
    return exportToBlob(elements, options).then(imageBlob => {
        const name = options?.filename || "untitled";
        const extension = FILE_EXTENSIONS[options?.format] || FILE_EXTENSIONS.PNG;
        return blobToFile(imageBlob, `${name}${extension}`);
    });
};
