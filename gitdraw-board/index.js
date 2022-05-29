// Available modes
const RESIZE_MODE = Symbol("mode:resize");
const DRAG_MODE = Symbol("mode:drag");
const TEXT_INPUT_MODE = Symbol("mode:text-input");

// Available keys
const KEYS = {
    ESCAPE: "Escape",
    BACKSPACE: "Backspace",
    ARROW_DOWN: "ArrowDown",
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_UP: "ArrowUp",
};

// Color parser
export const parseColor = (color, opacity) => {
    if (color === "transparent") {
        return color; // Nothing to do if color is transparent
    }
    // Get RGB values from color and return the RGBA color
    return `rgba(${color.match(/\d+/g).slice(0, 3).join(",")},${opacity})`;
};

// Convert a data to blob
// Idea from https://stackoverflow.com/a/19328891
const toBlob = (content, type) => {
    return new Blob([content], {
        type: type,
    });
};

// Convert DataURL to blob
// https://stackoverflow.com/a/30407959
const dataUrlToBlob = data => {
    const list = data.split(",");
    const bstr = atob(list[1]);
    const size = bstr.length;
    const u8list = new Uint8Array(size);
    while (n > 0) {
        u8list[n-1] = bstr.charCodeAt(n-1);
        n = n - 1;
    }
    return new Blob([u8list], {
        "type": list[0].match(/:(.*?);/)[1], // Extract mime type
    });
};

// Convert Blob to DataURL
const blobToDataUrl = blob => {
    return new Promise(resolve => {
        const file = new FileReader();
        file.onload = event => {
            return resolve(event.target.result);
        };
        return file.readAsDataURL(blob);
    });
};

// Get pasted items
const getDataFromClipboard = event => {
    return new Promise(resolve => {
        const items = event?.clipboardData?.items || [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i]; // Get current item
            if (item.type.indexOf("image") !== -1) {
                return resolve({type: "image", blob: item.getAsFile()});
            }
            else if (item.type.indexOf("text") !== -1) {
                return item.getAsString(content => {
                    return resolve({type: "text", blob: content});
                });
            }
        }
    });
};

// Parse clipboard data
const parseClipboardBlob = (type, blob) => {
    if (type === "text") {
        return Promise.resolve(blob.trim());
    }
    // Convert blob to dataURL
    return blobToDataUrl(blob);
};

// For each reversed
const forEachRev = (list, callback) => {
    for (let i = list.length - 1; i >= 0; i--) {
        callback(list[i], i); // Call this element
    }
};

// Get absolute positions
const getAbsolutePositions = (position, size) => {
    return [
        Math.min(position, position + size),
        Math.max(position, position + size)
    ];
};

// Measure text size
const measureText = (text, textSize, textFont) => {
    const size = {width: 0, height: 0}; // To store the computed text size
    if (text.length > 0) {
        if (!measureText.div) {
            measureText.div = document.createElement("div");
            measureText.div.style.position = "absolute";
            measureText.div.style.visibility = "hidden";
            measureText.div.style.top = "-9999px";
            measureText.div.style.left = "-9999px";
            measureText.div.style.lineHeight = "normal"; // Set line-height as normal
            measureText.div.style.whiteSpace = "pre";
            document.body.appendChild(measureText.div);
        }
        measureText.div.innerHTML = text.replace(/\r\n?/g, "\n").split("\n").join("<br>");
        measureText.div.style.fontFamily = textFont;
        measureText.div.style.fontSize = textSize + "px";
        size.width = measureText.div.offsetWidth; // Set computed width
        size.height = measureText.div.offsetHeight; // Set computed height
        // document.body.removeChild(div); // Remove div from DOM
    }
    // Return the text size
    return size;
};

// Create a temporal canvas element
const createCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

// Create an image element
// https://stackoverflow.com/a/4776378
const createImage = content => {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = content; // Set image source
    });
};

// Generate a screenshot of the provided canvas and the specified region
// https://stackoverflow.com/a/13074780
const screenshot = (originalCanvas, region) => {
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

// Check for arrow keys
const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};

// Check if the provided event.target is related to an input element
const isInputTarget = e => {
    return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
};

// Set selection
const setSelection = (selection, elementsList) => {
    const [sxStart, sxEnd] = getAbsolutePositions(selection.x, selection.width);
    const [syStart, syEnd] = getAbsolutePositions(selection.y, selection.height);
    
    elementsList.forEach(element => {
        if (element.type !== "selection") {
            // Get element absolute positions
            const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
            const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
            // Set if this element is selected
            element.selected = sxStart <= xStart && syStart <= yStart && xEnd <= sxEnd && yEnd <= syEnd;
        }
    });
};

// Create a snapshot of the selection
const snapshotSelection = selection => {
    return selection.map(element => ({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
    }));
};

// Get resize points
const getResizePoints = element => {
    //Check for rectangle or ellipse
    if (element.type === "rectangle" || element.type === "ellipse" || element.type === "image") {
        return [
            {orientation: "ltd", x: element.x, y: element.y},
            {orientation: "tv", x: element.x + element.width / 2, y: element.y},
            {orientation: "rtd", x: element.x + element.width, y: element.y},
            {orientation: "lh", x: element.x, y: element.y + element.height / 2},
            {orientation: "rh", x: element.x + element.width, y: element.y + element.height / 2},
            {orientation: "lbd", x: element.x, y: element.y + element.height},
            {orientation: "rbd", x: element.x + element.width, y: element.y + element.height},
            {orientation: "bv", x: element.x + element.width / 2, y: element.y + element.height},
        ];
    }
    // Check for line or arrow
    else if (element.type === "line" || element.type === "arrow") {
        return [
            {orientation: "ltd", x: element.x, y: element.y},
            {orientation: "rbd", x: element.x + element.width, y: element.y + element.height},
        ];
    }
    // Default: no resize points
    return [];
};

// Check if the cursor is inside a resize point
const inResizePoint = (element, x, y, radius) => {
    const points = getResizePoints(element);
    // Check for no resize points of this element
    if (points.length === 0) {
        return null;
    }
    // Check for each resize point
    for (let i = 0; i < points.length; i++) {
        if (points[i].x - radius <= x && x <= points[i].x + radius) {
            if (points[i].y - radius <= y && y <= points[i].y + radius) {
                return points[i];
            }
        }
    }
    // Default: no resize point found
    return null;
};

// Available elements
export const elements = {
    selection: {
        icon: "pointer",
        init: config => ({
            color: config.selectionColor, // "rgb(78, 145, 228)",
            opacity: config.selectionOpacity, // 0.1,
        }),
        draw: (canvas, element) => {
            canvas.globalAlpha = element.opacity;
            canvas.beginPath();
            canvas.fillStyle = element.color;
            canvas.rect(element.x, element.y, element.width, element.height);
            canvas.fill();
            canvas.globalAlpha = 1; // Reset alpha
        },
        update: () => null,
    },
    rectangle: {
        icon: "square",
        init: config => ({
            fillColor: "transparent",
            fillOpacity: 1.0,
            strokeColor: config.defaultColor, // colors.black,
            strokeWidth: 1,
            strokeDash: false,
            strokeOpacity: 1.0,
            radius: 0,
            textAlign: "center",
            textColor: config.defaultColor, // colors.black,
            textFont: config.fontFamily, // "sans-serif",
            textOpacity: 1.0,
            textSize: 16,
            textContent: "",
        }),
        draw: (canvas, element, shouldDrawInnerText) => {
            const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
            const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
            const halfWidth = Math.abs(element.width) / 2;
            const halfHeight = Math.abs(element.height) / 2;
            const radius = Math.min(element.radius, halfWidth, halfHeight);
            // canvas.restore();
            canvas.beginPath();
            // canvas.globalAlpha = element.opacity;
            // canvas.rect(element.x, element.y, element.width, element.height);
            canvas.moveTo(xStart + radius, yStart);
            canvas.lineTo(xEnd - radius, yStart);
            canvas.quadraticCurveTo(xEnd, yStart, xEnd, yStart + radius);
            canvas.lineTo(xEnd, yEnd - radius);
            canvas.quadraticCurveTo(xEnd, yEnd, xEnd - radius, yEnd);
            canvas.lineTo(xStart + radius, yEnd);
            canvas.quadraticCurveTo(xStart, yEnd, xStart, yEnd - radius);
            canvas.lineTo(xStart, yStart + radius);
            canvas.quadraticCurveTo(xStart, yStart, xStart + radius, yStart);
            canvas.closePath();
            canvas.fillStyle = parseColor(element.fillColor, element.fillOpacity);
            canvas.fill();

            // Check for no stroke color --> render rectangle stroke
            if (element.strokeWidth > 0 && element.strokeColor !== "transparent") {
                canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
                canvas.lineWidth = element.strokeWidth; // + px;
                // Check for line dash
                if (element.strokeDash === true) {
                    const lineDash = element.strokeWidth * 3;
                    canvas.setLineDash([lineDash, lineDash]); // Set default line-dash
                }
                else {
                    canvas.setLineDash([]); // Clear line-dash style
                }
                // Apply stroke
                canvas.stroke();
            }

            if (shouldDrawInnerText) {
                drawInnerText(canvas, element);
            }
            // context.globalAlpha = 1; // Reset opacity
        },
        update: () => null,
    },
    ellipse: {
        icon: "circle",
        init: config => ({
            fillColor: "transparent",
            fillOpacity: 1.0,
            strokeColor: config.defaultColor, // colors.black,
            strokeOpacity: 1.0,
            strokeWidth: 1,
            strokeDash: false,
            textAlign: "center",
            textColor: config.defaultColor, // colors.black,
            textFont: config.fontFamily, // "sans-serif",
            textOpacity: 1.0,
            textSize: 16,
            textContent: ""
        }),
        draw: (canvas, element, shouldDrawInnerText) => {
            const rx = element.width / 2;
            const ry = element.height / 2;
            canvas.beginPath();
            // canvas.globalAlpha = element.opacity;
            canvas.ellipse(element.x + rx, element.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2*Math.PI);
            canvas.fillStyle = parseColor(element.fillColor, element.fillOpacity);
            canvas.fill();

            // Check for no stroke color --> render rectangle stroke
            if (element.strokeWidth > 0 && element.strokeColor !== "transparent") {
                canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
                canvas.lineWidth = element.strokeWidth; // + "px";
                // Check for line dash
                if (element.strokeDash === true) {
                    const lineDash = element.strokeWidth * 3;
                    canvas.setLineDash([lineDash, lineDash]);
                }
                else {
                    canvas.setLineDash([]);
                }
                // Apply stroke
                canvas.stroke();
            }

            if (shouldDrawInnerText) {
                drawInnerText(canvas, element);
            }
            // canvas.globalAlpha = 1; //Reset opacity
        },
        update: () => null,
    },
    line: {
        icon: "minus",
        init: config => ({
            strokeColor: config.defaultColor, // colors.black,
            strokeWidth: 1,
            strokeDash: false,
            strokeOpacity: 1.0,
            lineStart: "none",
            lineEnd: "none",
        }),
        draw: (canvas, element) => {
            if (element.strokeWidth === 0 || element.strokeColor === "transparent") {
                return null; // Nothing to render
            }
            const length = Math.sqrt(Math.pow(element.width, 2) + Math.pow(element.height, 2));
            canvas.beginPath();
            // canvas.globalAlpha = element.opacity;
            canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
            canvas.lineWidth = element.strokeWidth; // + "px";
            canvas.lineCap = "butt"; // Default linecap
            canvas.setLineDash([]); // Clear line-dash style
            if (element.strokeDash === true) {
                const lineDash = element.strokeWidth * 3;
                canvas.setLineDash([lineDash, lineDash]);
            }
            canvas.moveTo(element.x, element.y);
            canvas.lineTo(element.x + element.width, element.y + element.height);
            canvas.stroke();
            canvas.setLineDash([]); // Clear line-dash style
            // Add line start style
            if (element.lineStart && element.lineStart !== "none") {
                drawGlyph(canvas, element.lineStart, "start", element, length);
            }
            // Add line end style
            if (element.lineEnd && element.lineEnd !== "none") {
                drawGlyph(canvas, element.lineEnd, "end", element, length);
            }
            // canvas.globalAlpha = 1; // Reset opacity
        },
        update: () => null,
    },
    text: {
        icon: "text",
        init: config => ({
            textAlign: "left",
            textColor: config.defaultColor, // colors.black,
            textSize: 16,
            textFont: config.fontFamily, // "sans-serif",
            textOpacity: 1.0,
            textContent: "",
        }),
        draw: (canvas, element, shouldDrawText) => {
            if (shouldDrawText) {
                canvas.save();
                canvas.beginPath();
                canvas.rect(element.x, element.y, element.width, element.height);
                canvas.clip();
                // canvas.globalAlpha = element.opacity;
                canvas.font = `${element.textSize}px ${element.textFont}`;
                canvas.textAlign = element.textAlign; // "start"; // Text left aligned
                canvas.textBaseline = "alphabetic"; // Default baseline
                canvas.fillStyle = parseColor(element.textColor, element.textOpacity);
                const lines = element.textContent.replace(/\r\n?/g, "\n").split("\n");
                let x = element.x; // Default left aligned
                if (element.textAlign === "center") {
                    x = x + element.width / 2; // Center text position
                }
                else if (element.textAlign === "right") {
                    x = x + element.width; // Right aligned text
                }
                // let lineHeight = element.height / lines.length;
                // let offset = element.height - element.baseline;
                for (let i = 0; i < lines.length; i++) {
                    canvas.fillText(lines[i], x, element.y + (i + 1) * element.textSize); 
                }
                // canvas.fill();
                // canvas.closePath();
                canvas.restore();
                // canvas.globalAlpha = 1; // Reset opacity
            }
        },
        update: (element, changedKeys) => {
            if (changedKeys.has("textContent") || changedKeys.has("textSize") || changedKeys.has("textFont")) {
                Object.assign(element, {
                    ...measureText(element.textContent, element.textSize, element.textFont),
                });
            }
        },
    },
    image: {
        icon: "image",
        init: config => ({
            content: null,
            img: null,
            opacity: 1.0,
        }),
        draw: (canvas, element) => {
            canvas.globalAlpha = element.opacity;
            if (element.img !== null) {
                canvas.drawImage(element.img, element.x, element.y, element.width, element.height);
            }
            canvas.globalAlpha = 1; // Reset alpha
        },
        update: () => null,
    },
    screenshot: {
        icon: null,
        init: config => ({
            color: config.screenshotColor, // "rgb(76, 205, 172)",
            opacity: config.screenshotOpacity,
        }),
        draw: (canvas, element) => {
            canvas.globalAlpha = element.opacity;
            canvas.beginPath();
            canvas.fillStyle = element.color;
            canvas.rect(element.x, element.y, element.width, element.height);
            canvas.fill();
            canvas.globalAlpha = 1; //Reset alpha
        },
        update: () => null,
    },
};

// Render element inner text
const drawInnerText = (canvas, element) => {
    if (element.textContent.length === 0 || element.textColor === "transparent") {
        return null; // Nothing to render
    }
    canvas.beginPath();
    canvas.font = `${element.textSize}px ${element.textFont}`;
    canvas.fillStyle = parseColor(element.textColor, element.textOpacity);
    canvas.textAlign = "center"; //Center text in the rectangle
    canvas.textBaseline = "middle"; //Center text in the line position
    const lines = element.textContent.replace(/\r\n?/g, "\n").split("\n");
    const lineHeight = element.textSize; //element.height / lines.length;
    const x = element.x + element.width / 2; //Text x position
    const y = element.y + (element.height - lineHeight * lines.length) / 2; 
    // let offset = element.height - element.baseline;
    for (let i = 0; i < lines.length; i++) {
        canvas.fillText(lines[i], x, y + i * lineHeight + lineHeight / 2);
    }
};

// Draw a glyph
const drawGlyph = (canvas, type, position, element, length) => {
    const size = element.strokeWidth * 2 + 4;
    if (length < size) {
        return null; // Unable to draw the element
    }
    const x = (position === "start") ? element.x : element.x + element.width; //x coordinate
    const y = (position === "start") ? element.y : element.y + element.height; //y coordinate
    const sign = (position === "start") ? +1 : -1;
    const dx = element.width; // - element.x;
    const dy = element.height; // - element.y;
    const angle = Math.atan2(dy, dx); // Arrow line angle
    // Initialize the path
    canvas.beginPath();
    canvas.setLineDash([]); // Clear line-dash style
    // Check for arrow element
    if (type === "arrow") {
        const angle2 = Math.PI / 8;
        const hip = size * 4 / 3;
        canvas.moveTo(x, y);
        canvas.lineTo(x + sign * hip * Math.cos(angle - angle2), y - sign * hip * Math.sin(angle2 - angle));
        canvas.lineTo(x + sign * hip * Math.cos(angle2 + angle), y + sign * hip * Math.sin(angle2 + angle));
    }
    // Check for square element
    else if (type === "square") {
        const angle2 = Math.atan(0.5); // Second angle for the rectangle
        const hsize = size / 2; // Half of the size
        const hip = Math.sqrt(size * size + hsize * hsize);
        canvas.moveTo(x, y);
        canvas.lineTo(x + sign * hsize * Math.sin(angle), y - sign * hsize * Math.cos(angle));
        canvas.lineTo(x + sign * hip * Math.cos(angle - angle2), y - sign * hip * Math.sin(angle2 - angle));
        canvas.lineTo(x + sign * hip * Math.cos(angle + angle2), y + sign * hip * Math.sin(angle2 + angle));
        canvas.lineTo(x - sign * hsize * Math.sin(angle), y + sign * hsize * Math.cos(angle));
    }
    // Check for circle
    else if (type === "circle") {
        const hsize = size / 2; // Half of the size
        const cx = x + sign * hsize * Math.cos(angle);
        const cy = y + sign * hsize * Math.sin(angle);
        canvas.arc(cx, cy, hsize, 0, 2 * Math.PI);
    }
    // Fill the glyph
    canvas.closePath();
    canvas.strokeStyle = parseColor(element.strokeColor, element.strokeOpacity);
    canvas.stroke();
    canvas.fillStyle = parseColor(element.strokeColor, element.strokeOpacity);
    // canvas.fillStyle = element.strokeColor;
    canvas.fill();
};

// Create board
export const createBoard = (parent, opt) => {
    const options = {
        defaultColor: "rgb(0,0,0)",
        //Selection values
        selectionColor: "rgb(78, 145, 228)",
        selectionOpacity: 0.1,
        // Screenshot value
        screenshotColor: "rgb(76, 205, 172)",
        screenshotOpacity: 0.2,
        // Default grid values
        gridColor: "rgb(238, 242, 247)", 
        gridWidth: 1, //Grid lines width
        gridOpacity: 0.8,
        gridSize: 10,
        gridStyle: "lined",
        // Default resize values
        resizeColor: "rgb(27, 94, 177)",
        resizeWidth: 2, // Resize line width
        resizeOpacity: 1.0,
        resizeRadius: 5,
        // Text configuration
        fontFamily: "sans-serif",
        ...opt,
    };

    // Initialize board context
    const ctx = {
        parent: parent,
        canvas: createCanvas("100px", "100px"),
        canvasGrid: createCanvas("100px", "100px"),
        input: document.createElement("textarea"),
        options: options,
        mode: "",
        currentTool: "selection",
        currentElement: null,
        currentElementSelected: false,
        currentElementDragged: false,
        resizeOrientation: null,
        selection: [],
        selectionLocked: false,
        snapshot: [],
        elements: [],
        width: 200,
        height: 200,
        grid: true,
        listeners: {},
    };

    // To register event listeners
    ctx.on = (name, fn) => (ctx.listeners[name] = ctx.listeners[name] || []).push(fn);
    ctx.off = (name, fn) => (ctx.listeners[name] || []).filter(f => f !== fn);
    ctx.trigger = (name, args) => (ctx.listeners[name] || []).forEach(fn => fn(args));

    // Draw the board
    ctx.draw = () => {
        const canvas = ctx.canvas.getContext("2d");
        canvas.clearRect(0, 0, ctx.width, ctx.height);

        forEachRev(ctx.elements, element => {
            const shouldDrawInnerText = ctx.mode !== TEXT_INPUT_MODE || ctx.currentElement?.id !== element.id;
            
            // Draw the element
            ctx.drawElement(element, canvas, shouldDrawInnerText);

            // Check if this element is selected --> draw selection area
            if (shouldDrawInnerText && element.selected === true && element.type !== "selection") {
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                canvas.beginPath();
                canvas.setLineDash([8, 4]);
                canvas.strokeStyle = ctx.options.resizeColor;
                canvas.lineWidth = ctx.options.resizeWidth;
                canvas.rect(xStart, yStart, xEnd - xStart, yEnd - yStart);
                canvas.stroke();
                canvas.setLineDash([]); // Reset line-dash
                // Check if is the unique selected elements
                if (ctx.selection.length === 1 && element.locked === false) {
                    getResizePoints(element).forEach(point => {
                        canvas.beginPath();
                        canvas.fillStyle = ctx.options.resizeColor; // selectionColor;
                        canvas.arc(point.x, point.y, ctx.options.resizeRadius, 0, 2*Math.PI);
                        canvas.fill();
                    });
                }
            }
        });
    };

    ctx.drawGrid = () => {
        const canvas = ctx.canvasGrid.getContext("2d");
        canvas.clearRect(0, 0, ctx.width, ctx.height);
    
        // Check for drawing the grid
        if (ctx.grid === true) {
            canvas.globalAlpha = ctx.options.gridOpacity;
            canvas.beginPath();
            canvas.setLineDash([]);
            canvas.strokeStyle = ctx.options.gridColor;
            canvas.lineWidth = ctx.options.gridWidth; 
            // Horizontal rules
            for (let i = 0; i * ctx.options.gridSize < ctx.height; i++) {
                canvas.moveTo(0, i * ctx.options.gridSize);
                canvas.lineTo(ctx.width, i * ctx.options.gridSize);
            }
            // Vertical rules
            for (let i = 0; i * ctx.options.gridSize < ctx.width; i++) {
                canvas.moveTo(i * ctx.options.gridSize, 0);
                canvas.lineTo(i * ctx.options.gridSize, ctx.height);
            }
            // Draw the grid
            canvas.stroke();
            canvas.globalAlpha = 1;
        }
    };

    // Elements management
    ctx.createElement = element => ({
        ...elements[element.type].init(ctx.options),
        ...element,
        id: Date.now(), // TODO: replace this
        width: element.width || 0,
        height: element.height || 0,
        selected: false,
        locked: false,
    });
    ctx.updateElement = (el, changed) => elements[el.type].update(el, new Set(changed || []));
    ctx.drawElement = (el, canvas, shouldDrawInnerText) => elements[el.type].draw(canvas, el, shouldDrawInnerText);
    ctx.removeElement = el => {
        ctx.elements = ctx.elements.filter(element => element.id !== el.id);
        ctx.selection = ctx.selection.filter(element => element.id !== el.id);
    };
    ctx.addElement = element => {
        Object.assign(element, {
            selected: true, // Set element as selected
            x: ctx.getPosition((ctx.width - element.width) / 2),
            y: ctx.getPosition((ctx.height - element.height) / 2), 
        });
        ctx.elements.unshift(element); // Save the new element
        ctx.selection = ctx.getSelection(); // Update the selection
    };

    // Selection managers
    ctx.removeSelection = () => {
        ctx.elements = ctx.elements.filter(element => !element.selected);
        ctx.selection = [];
    };
    ctx.clearSelection = () => {
        ctx.elements.forEach(element => element.selected = false);
        ctx.selection = [];
    };
    ctx.getSelection = () => ctx.elements.filter(element => element.selected);
    ctx.isSelectionLocked = () => ctx.selection.every(element => element.locked);

    // Text input managers
    ctx.showInput = () => {
        ctx.input.style.top = ctx.currentElement.y + "px";
        ctx.input.style.left = ctx.currentElement.x + "px";
        ctx.input.style.color = ctx.currentElement.textColor;
        ctx.input.style.fontSize = ctx.currentElement.textSize + "px";
        ctx.input.style.fontFamily = ctx.currentElement.textFont;
        ctx.input.style.textAlign = ctx.currentElement.textAlign;
        ctx.input.value = ctx.currentElement.textContent || ""; // Get text content
        ctx.input.style.display = "inline-block"; // Show input
        ctx.input.focus(); // focus in the new input
        ctx.updateInput();
    };
    ctx.hideInput = () => {
        ctx.input.style.display = "none";
        ctx.input.value = ""; // Remove current value
        ctx.input.blur();
    };
    ctx.updateInput = () => {
        ctx.input.style.height = "1em";
        const size = measureText(ctx.input.value || "", ctx.currentElement.textSize, ctx.currentElement.textFont);
        const width = Math.max(size.width + 1, ctx.currentElement.width);
        const height = Math.max(ctx.input.scrollHeight, ctx.currentElement.height);
        ctx.input.style.width = width;
        ctx.input.style.height = height;

        // Move text input to the correct position
        if (ctx.currentElement.type !== "text") {
            ctx.input.style.top = ctx.currentElement.y + ((ctx.currentElement.height - ctx.input.offsetHeight) / 2);
            // ctx.input.style.left = (ctx.currentElement.x + ((ctx.currentElement.width - ctx.input.offsetWidth) / 2)) + "px";
            if (ctx.currentElement.textAlign === "center") {
                ctx.input.style.left = ctx.currentElement.x - (width - ctx.currentElement.width) / 2;
            }
            else if (ctx.currentElement.textAlign === "right") {
                ctx.input.style.left = ctx.currentElement.x - (width - ctx.currentElement.width);
            }
        }
    };
    ctx.submitInput = () => {
        const value = ctx.input.value || "";
        const element = ctx.currentElement;
        if (value || element.type !== "text") {
            Object.assign(element, {
                textContent: value || "",
                selected: true,
            });
            ctx.updateElement(element, ["textContent"]);
            ctx.selection = ctx.getSelection();
            ctx.selectionLocked = false;
        } else {
            // Remove this element
            ctx.removeElement(element);
        }
        ctx.currentElement = null;
        ctx.mode = ""; // Reset mode
        ctx.hideInput();
    };

    // Calculate the position
    ctx.getPosition = v => {
        return ctx.grid ? Math.round(v / ctx.options.gridSize) * ctx.options.gridSize : v;
    };

    // Handle paste
    const handlePaste = event => {
        return !isInputTarget(event) && getDataFromClipboard(event).then(data => {
            ctx.clearSelection(); // Clear the current selection
            parseClipboardBlob(data.type, data.blob).then(content => {
                // Check for not image type
                if (data.type !== "image") {
                    const element = ctx.createElement({
                        type: data.type,
                        textContent: content,
                    });
                    ctx.addElement(element);
                    ctx.updateElement(element, ["x", "y", "textContent"]);
                    ctx.draw();
                    console.log(element);
                    return ctx.trigger("update");
                }
                // Load as a new image
                createImage(content).then(img => {
                    const element = ctx.createElement({
                        type: "image",
                        width: img.width,
                        height: img.height,
                        img: img,
                    });
                    ctx.addElement(element);
                    ctx.updateElement(element, ["img", "width", "height"]);
                    ctx.draw();
                    ctx.trigger("update");
                });
            });
        });
    };

    // Handle document key down
    const handleKeyDown = event => {
        if (ctx.mode === TEXT_INPUT_MODE || isInputTarget(event)) {
            if (ctx.mode === TEXT_INPUT_MODE && event.key === KEYS.ESCAPE) {
                event.preventDefault();
                ctx.submitInput();
                ctx.draw();
                ctx.trigger("update");
            }

            return; // Stop event processing
        }
        // Check ESCAPE key --> reset selection
        else if (event.key === KEYS.ESCAPE) {
            event.preventDefault();
            ctx.clearSelection();
            ctx.draw();
            ctx.trigger("update");
        }
        // Check for backspace key --> remove elements
        else if (event.key === KEYS.BACKSPACE) {
            event.preventDefault();
            ctx.removeSelection();
            ctx.draw();
            ctx.trigger("update");
        }
        // Check for arrow keys --> move elements
        else if (isArrowKey(event.key) === true) {
            event.preventDefault();
            const step = ctx.grid ? ctx.options.gridSize : (event.shiftKey ? 5 : 1);

            // Move selected elements
            if (event.key === KEYS.ARROW_UP) {
                ctx.selection.forEach(el => el.y = ctx.getPosition(el.y - step));
            }
            else if (event.key === KEYS.ARROW_DOWN) {
                ctx.selection.forEach(el => el.y = ctx.getPosition(el.y + step));
            }
            else if (event.key === KEYS.ARROW_LEFT) {
                ctx.selection.forEach(el => el.x = ctx.getPosition(el.x - step));
            }
            else if (event.key === KEYS.ARROW_RIGHT) {
                ctx.selection.forEach(el => el.x = ctx.getPosition(el.x + step));
            }
            ctx.draw();
            ctx.trigger("update");
        }
    };

    // Handle pointer down event
    const handlePointerDown = event => {
        event.preventDefault();

        // Remove current selection
        const currentSelection = document.getSelection();
        if (currentSelection?.anchorNode) {
            currentSelection.removeAllRanges();
        }

        // Check for text input mode --> submit text
        if (ctx.mode === TEXT_INPUT_MODE) {
            ctx.submitInput();
            ctx.draw();
            ctx.trigger("update");
            return;
        }

        ctx.currentElement = null;
        ctx.lastX = event.offsetX; // event.clientX - event.target.offsetLeft;
        ctx.lastY = event.offsetY; // event.clientY - event.target.offsetTop;
        ctx.currentElementDragged = false;
        ctx.currentElementSelected = false;

        // Check if we are in a resize point
        if (ctx.selection.length === 1) {
            const point = inResizePoint(ctx.selection[0], ctx.lastX, ctx.lastY, ctx.options.resizeRadius);
            if (point !== null) {
                ctx.currentElement = ctx.selection[0]; // Save current element
                ctx.resizeOrientation = point.orientation; // Save resize orientation
                ctx.mode = RESIZE_MODE; // Swtich to resize mode
                ctx.snapshot = snapshotSelection(ctx.selection); // Create a snapshot of the selection
                return; // Stop event
            }
        }
        // Check the selected type
        if (ctx.currentTool === "selection") {
            // Check if the point is inside an element
            const insideElements = ctx.elements.filter(element => {
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                // Check if the position is inside the element
                return (xStart <= ctx.lastX && ctx.lastX <= xEnd) 
                    && (yStart <= ctx.lastY && ctx.lastY <= yEnd);
            });
            if (insideElements.length > 0) {
                const el = insideElements[0]; // Get only the first element
                ctx.currentElement = el; // Save the current dragged element
                ctx.currentElementSelected = el.selected; // Save if element is already selected
                ctx.mode = DRAG_MODE;
                // Check if this element is not selected
                if (el.selected === false && !event.shiftKey) {
                    ctx.clearSelection(); // Remove other elements
                }
                el.selected = true;
                ctx.selection = ctx.getSelection();
                ctx.snapshot = snapshotSelection(ctx.selection);
                ctx.selectionLocked = ctx.isSelectionLocked();
                return; // Stop event
            }
        }
        // Create a new element
        const element = ctx.createElement({
            type: ctx.currentTool,
            x: ctx.getPosition(ctx.lastX), 
            y: ctx.getPosition(ctx.lastY),
        });
        ctx.elements.unshift(element);
        ctx.currentElement = element;
        ctx.clearSelection();
    };

    // Handle pointer move
    const handlePointerMove = event => {
        event.preventDefault();
        const x = event.offsetX; // event.clientX - event.target.offsetLeft;
        const y = event.offsetY; // event.clientY - event.target.offsetTop;
        // Check for no selected elements
        if (!ctx.currentElement || ctx.mode === TEXT_INPUT_MODE) {
            return;
        }
        ctx.currentElementDragged = true;
        // Check if we are resizing the element
        if (ctx.mode === RESIZE_MODE) {
            if (ctx.currentElement.locked) {
                return null;
            }
            const element = ctx.currentElement;
            const snapshot = ctx.snapshot[0]; // Get snapshot of the current element
            const orientation = ctx.resizeOrientation;
            const deltaX = x - ctx.lastX; // ctx.getPosition(x - ctx.lastX);
            const deltaY = y - ctx.lastY; // ctx.getPosition(y - ctx.lastY);
            // Check the orientation
            if (orientation === "rh") {
                element.width = ctx.getPosition(element.x + snapshot.width + deltaX) - element.x;
            }
            else if (orientation === "lh") {
                element.x = ctx.getPosition(snapshot.x + deltaX);
                element.width = snapshot.width + (snapshot.x - element.x);
            }
            else if (orientation === "bv") {
                element.height = ctx.getPosition(element.y + snapshot.height + deltaY) - element.y;
            }
            else if (orientation === "tv") {
                element.y = ctx.getPosition(snapshot.y + deltaY);
                element.height = snapshot.height + (snapshot.y - element.y);
            }
            else if (orientation === "ltd") {
                element.x = ctx.getPosition(snapshot.x + deltaX);
                element.y = ctx.getPosition(snapshot.y + deltaY);
                element.width = snapshot.width + (snapshot.x - element.x);
                element.height = snapshot.height + (snapshot.y - element.y);
            }
            else if (orientation === "rtd") {
                element.y = ctx.getPosition(snapshot.y + deltaY);
                element.height = snapshot.height + (snapshot.y - element.y);
                element.width = ctx.getPosition(element.x + snapshot.width + deltaX) - element.x;
            }
            else if (orientation === "lbd") {
                element.x = ctx.getPosition(snapshot.x + deltaX);
                element.width = snapshot.width + (snapshot.x - element.x);
                element.height = ctx.getPosition(element.y + snapshot.height + deltaY) - element.y;
            }
            else if (orientation === "rbd") {
                element.width = ctx.getPosition(element.x + snapshot.width + deltaX) - element.x;
                element.height = ctx.getPosition(element.y + snapshot.height + deltaY) - element.y;
            }
        }
        // Check if we have selected elements
        else if (ctx.mode === DRAG_MODE && ctx.selection.length > 0) {
            if (ctx.selectionLocked) {
                return null; // Move is not allowed --> selection is locked
            }
            const incrementX = x - ctx.lastX;
            const incrementY = y - ctx.lastY;
            // Move all elements
            ctx.selection.forEach((element, index) => {
                if (!element.locked) {
                    element.x = ctx.getPosition(ctx.snapshot[index].x + incrementX);
                    element.y = ctx.getPosition(ctx.snapshot[index].y + incrementY);
                }
            });
        }
        // Check if we have a drag element (but not text)
        else if (ctx.currentElement && ctx.currentElement.type !== "text") {
            const element = ctx.currentElement;
            const deltaX = ctx.getPosition(x - element.x);
            //let deltaY = this.ctx.getPosition(y - element.y);
            element.width = deltaX;
            element.height = event.shiftKey ? deltaX : ctx.getPosition(y - element.y);

            // Check if the elemement is a selection
            if (element.type === "selection") {
                setSelection(element, ctx.elements);
            }
        }
        // Check for text element --> update only text position
        else if (ctx.currentElement && ctx.currentElement.type === "text") {
            ctx.currentElement.x = ctx.getPosition(x);
            ctx.currentElement.y = ctx.getPosition(y);
        }

        ctx.draw();
    };

    // Handle pointer up
    const handlePointerUp = event => {
        event.preventDefault();
        // Check for no current element active
        if (!ctx.currentElement || ctx.mode === TEXT_INPUT_MODE) {
            return;
        }
        // Check for clicked element
        if (!ctx.currentElementDragged && ctx.selection.length > 0) {
            if (ctx.currentElementSelected === true && event.shiftKey) {
                ctx.currentElement.selected = false;
            }
            // Check if no shift key is pressed --> keep only this current element in selection
            else if (!event.shiftKey) {
                ctx.clearSelection();
                ctx.currentElement.selected = true;
            }
        }
        // Check for adding a new element
        if (ctx.currentTool !== "selection" && ctx.currentTool !== "screenshot") {
            ctx.currentElement.selected = true;
            ctx.updateElement(ctx.currentElement, ["selected"]);
        }
        // Remove selection elements
        else {
            ctx.elements = ctx.elements.filter(element => {
                return element.type !== "selection" && element.type !== "screenshot";
            });
        }
        // Check for screenshot element
        if (ctx.currentTool === "screenshot") {
            const [xStart, xEnd] = getAbsolutePositions(ctx.currentElement.x, ctx.currentElement.width);
            const [yStart, yEnd] = getAbsolutePositions(ctx.currentElement.y, ctx.currentElement.height);
            ctx.trigger("screenshot", {
                x: xStart,
                width: xEnd - xStart,
                y: yStart,
                height: yEnd - yStart,
            });
        }
        // Check for text element
        if (ctx.currentTool === "text") {
            ctx.currentElement.selected = false; // Disable selection
            ctx.mode = TEXT_INPUT_MODE;
            ctx.showInput();
        }
        // If no text element, reset current element
        else {
            ctx.currentElement = null;
            ctx.mode = "";
        }
        
        // Reset selection
        ctx.selection = ctx.getSelection();
        ctx.selectionLocked = ctx.isSelectionLocked();
        ctx.currentTool = "selection";
        ctx.draw();
        ctx.trigger("update");
    };

    // Handle double click
    const handleDoubleClick = event => {
        event.preventDefault();
        // if (ctx.selection.length === 1 && ctx.selection[0].type === "text") {
        if (ctx.selection.length === 1 && typeof ctx.selection[0].textContent === "string") {
            ctx.currentElement = ctx.selection[0];
        }
        else {
            ctx.currentElement = ctx.createElement({
                type: "text",
                x: parseInt(event.clientX),
                y: parseInt(event.clientY),
            });
            ctx.elements.unshift(ctx.currentElement);
        }
        ctx.mode = TEXT_INPUT_MODE;
        ctx.clearSelection();
        ctx.showInput();
        ctx.draw();
        ctx.trigger("update");
    };

    // Handle window resize
    const handleResize = () => {
        ctx.width = ctx.parent.offsetWidth;
        ctx.height = ctx.parent.offsetHeight;
        ctx.canvas.setAttribute("width", ctx.width + "px");
        ctx.canvas.setAttribute("height", ctx.height + "px");
        ctx.canvasGrid.setAttribute("width", ctx.width + "px");
        ctx.canvasGrid.setAttribute("height", ctx.height + "px");
        ctx.draw();
        ctx.drawGrid();
        // ctx.trigger("update");
    };

    // Append elements and update parent styles
    ctx.parent.style.width = "100%";
    ctx.parent.style.height = "100%";
    ctx.parent.style.position = "fixed";
    ctx.parent.style.top = "0px";
    ctx.parent.style.left = "0px";
    
    // Apply body styles
    // document.querySelector("body").style.touchAction = "pan-y";
    document.querySelector("body").style.overflow = "hidden";

    // Canvas styles
    [ctx.canvas, ctx.canvasGrid].forEach(el => {
        el.style.userSelect = "none";
        el.style.touchAction = "none";
        el.style.position = "absolute";
        el.style.top = "0px";
        el.style.bottom = "0px";
    });

    // Input style
    ctx.input.style.display = "none";
    ctx.input.style.position = "absolute";
    ctx.input.style.width = "auto";
    ctx.input.style.minWidth = "1em";
    ctx.input.style.minHeight = "1em";
    ctx.input.style.outline = "0px";
    ctx.input.style.border = "0px solid transparent";
    // ctx.input.style.padding = "0px";
    ctx.input.style.padding = "3px 0px"; // Terrible hack to fix text position
    ctx.input.style.margin = "0px";
    ctx.input.style.resize = "none";
    ctx.input.style.overflow = "hidden";
    ctx.input.style.lineHeight = "1";
    ctx.input.style.backgroundColor = "transparent";
    ctx.input.style.wordBreak = "pre";
    ctx.input.style.whiteSpace = "break-word";

    // Append child items
    ctx.parent.style.width = "100%";
    ctx.parent.style.height = "100%";
    ctx.parent.style.overflow = "hidden";
    ctx.parent.appendChild(ctx.canvas);
    ctx.parent.appendChild(ctx.canvasGrid);
    ctx.parent.appendChild(ctx.input);

    // Register event listeners
    ctx.canvasGrid.addEventListener("pointerdown", handlePointerDown);
    ctx.canvasGrid.addEventListener("pointermove", handlePointerMove);
    ctx.canvasGrid.addEventListener("pointerup", handlePointerUp);
    ctx.canvasGrid.addEventListener("dblclick", handleDoubleClick);

    // Register text input event listeners
    ctx.input.addEventListener("input", () => ctx.updateInput());
    ctx.input.addEventListener("mousedown", e => e.stopPropagation());
    ctx.input.addEventListener("mouseup", e => e.stopPropagation());

    // Register document event listeners
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("paste", handlePaste, false);
    window.addEventListener("resize", handleResize, false);

    // Force a resize of the canvas
    handleResize();
    // ctx.draw();

    // Remove all event listeners
    ctx.destroy = () => {
        //Remove window/document listeners
        document.removeEventListener("keydown", handleKeyDown, false);
        document.removeEventListener("paste", handlePaste, false);
        window.removeEventListener("resize", handleResize, false);

        // Remove dom elements
        ctx.parent.removeChild(ctx.canvas);
        ctx.parent.removeChild(ctx.canvasGrid);
        ctx.parent.removeChild(ctx.input);

        // Reset body styles
        document.querySelector("body").style.overflow = "";
    };

    // Return public api
    return {
        on: ctx.on,
        off: ctx.off,
        destroy: ctx.destroy,
        clear: () => {
            ctx.elements = [];
            ctx.selection = [];
            ctx.draw();
        },
        updateOptions: newOptions => {
            Object.assign(ctx.options, newOptions);
            ctx.draw();
        },
        forceUpdate: () => {},
        // load: null,
        export: () => ({
            elements: ctx.elements.map(element => ({
                ...element,
                selected: false,
            })),
            width: ctx.width,
            height: ctx.height,
        }),
        setCurrentTool: tool => {
            ctx.clearSelection();
            ctx.currentTool = tool || "selection";
            ctx.draw();
        },
        getCurrentTool: () => ctx.currentTool,
        showGrid: () => {
            ctx.grid = true;
            ctx.drawGrid();
        },
        hideGrid: () => {
            ctx.grid = false;
            ctx.drawGrid();
        },
        toggleGrid: () => {
            ctx.grid = !ctx.grid;
            ctx.drawGrid();
        },
        isGridVisible: () => ctx.grid,
        updateSelection: (key, value) => {
            ctx.selection.forEach(element => {
                element[key] = value;
                ctx.updateElement(element, [key]);
            });
            ctx.draw();
        },
        cloneSelection: () => {
            const newElements = [];
            // Update the selection with the cloned elements
            ctx.selection = ctx.selection.map(element => {
                const clonedElement = {
                    ...element,
                    x: element.x + 10,
                    y: element.y + 10,
                    locked: false, // Reset locked attribute
                };
                newElements.push(clonedElement); // Save to the elements list
                element.selected = false; // Remove this element from selection
                return clonedElement;
            });
            forEachRev(newElements, el => ctx.elements.unshift(el));
            ctx.selectionLocked = false; // Reset selection locked flag
            ctx.draw();
        },
        lockSelection: () => {
            ctx.selectionLocked = true;
            ctx.selection.forEach(element => element.locked = true);
        },
        unlockSelection: () => {
            ctx.selectionLocked = false;
            ctx.selection.forEach(element => element.locked = false);
        },
        clearSelection: () => {
            ctx.clearSelection();
            ctx.draw();
        },
        removeSelection: () => {
            ctx.removeSelection();
            ctx.draw();
        },
        getSelection: () => ctx.selection,
        isSelectionLocked: () => ctx.selectionLocked,
        screenshot: region => screenshot(ctx.canvas, region),
    };
};
