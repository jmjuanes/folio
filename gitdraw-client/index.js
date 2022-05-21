// Globals
const resizeRadius = 5;
const lineCapTypes = ["none", "arrow", "square", "circle"];
const colors = {
    blue: [78, 145, 228], // "#4e91e4",
    mint: [76, 205, 172], // "#4ccdac",
    green: [74, 207, 127], // "#4acf7f",
    yellow: [251 ,200, 80], // "#fbc850",
    orange: [247, 128, 85], // "#f78055",
    red: [238, 103, 93], // "#ee675d",
    purple: [157, 129, 228], // "#9d81e4",
    brown: [167, 93, 88], // "#a75d58",
    gray: [238, 242, 247], // "#eef2f7",
    black: [0, 0, 0],
    white: [255, 255, 255],
    transparent: "transparent",
};

// Color parser
const parseColor = (color, opacity) => {
    if (color === "transparent") {
        return color; // Nothing to do if color is transparent
    }
    else if (typeof opacity !== "number") {
        return `rgb(${color.join(",")})`;
    }
    // Return the color with the transparency applied
    // return hex + (opacity * 255).toString(16);
    return `rgba(${color.join(",")},${opacity})`;
};

// Convert a data to blob
// Idea from https://stackoverflow.com/a/19328891
const toBlob = (content, type) => {
    return new Blob([content], {
        type: type,
    });
};

// Save Blob to file
// Based on https://stackoverflow.com/a/19328891
const blobToFile = (blob, name) => {
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
const blobToClipboard = blob => {
    return navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob,
        }),
    ]);
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
                return resolve({type: "image", blog: item.getAsFile()});
            }
            else if (item.type.indexOf("text") !== -1) {
                return item.getAsString(content => {
                    return resolve({type: "text", blob: content});
                });
            }
        }
    });
};

//Copy to clipboard
const copyToClipboard = text => {
    return Promise.resolve(null);
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
        const div = document.createElement("div");
        div.innerHTML = text.replace(/\r\n?/g, "\n").split("\n").join("<br>");
        div.style.position = "absolute";
        div.style.top = "-9999px";
        div.style.left = "-9999px";
        div.style.fontFamily = textFont;
        div.style.fontSize = textSize + "px";
        div.style.lineHeight = "normal"; // Set line-height as normal
        document.body.appendChild(div); // Append the div element
        size.width = div.offsetWidth; // Set computed width
        size.height = div.offsetHeight; // Set computed height
        document.body.removeChild(div); // Remove div from DOM
    }
    // Return the text size
    return size;
};

// Create a temporal canvas element
const createCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; // Set canvas width
    canvas.height = height; // Set canvas height
    // canvas.style.display = "none"; //Hide element
    return canvas;
};

// Crop canvas
// https://stackoverflow.com/a/13074780
const cropCanvas = (originalCanvas, options) => {
    return new Promise(resolve => {
        if (!options) {
            return originalCanvas.toBlob(blob => resolve(blob));
        }
        // Get screenshot
        const originalContext = originalCanvas.getContext("2d");
        const image = originalContext.getImageData(options.x || 0, options.y || 0, options.width, options.height);
        // Create a new canvas to draw the screenshot
        const canvas = createCanvas(options.width, options.height); // New canvas
        const context = canvas.getContext("2d");
        context.putImageData(image, 0, 0);
        return canvas.toBlob(blob => resolve(blob));
    });
};

// Check for arrow keys
const isArrowKey = key => {
    return key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight";
};

// Check if the provided event.target is related to an input element
const isInputTarget = event => {
    const target = event.target; // Get target element
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
};

// Parse elements
const parseElements = list => {
    if (!list || !Array.isArray(list)) {
        return []; //Return an empty list
    }
    // TODO: parse elements
    return list;
};

// Set selection
const setSelection = (selection, elements) => {
    // Get selection absolute positions
    const [sxStart, sxEnd] = getAbsolutePositions(selection.x, selection.width);
    const [syStart, syEnd] = getAbsolutePositions(selection.y, selection.height);
    // Mark all selected elements
    elements.forEach(element => {
        if (element.type !== "selection") {
            // Get element absolute positions
            const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
            const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
            // Set if this element is selected
            element.selected = sxStart <= xStart && syStart <= yStart && xEnd <= sxEnd && yEnd <= syEnd;
        }
    });
};

// Clear selection
const clearSelection = elements => {
    return elements.forEach(element => {
        element.selected = false; //Disable selection
    });
};

// Count selected elements
const countSelection = elements => {
    let count = 0;
    elements.forEach(element => {
        if (element.selected === true) {
            count = count + 1; // Increment the counter
        }
    });
    return count;
};

// Get selected elements
const getSelection = elements => {
    return elements.filter(element => element.selected);
};

// Create a snapshot of the selection
const snapshotSelection = elements => {
    return elements.map(element => ({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
    }));
};

// Check if all elements of the selection are locked
const isSelectionLocked = elements => {
    return elements.every(element => element.locked);
};

// Lock selection
const lockSelection = elements => {
    elements.forEach(element => element.locked = true);
};

// Unlock selection
const unlockSelection = elements => {
    elements.forEach(element => element.locked = false);
};

// Get resize points
const getResizePoints = element => {
    //Check for rectangle or ellipse
    if (element.type === "rectangle" || element.type === "ellipse" || element.type === "image" || element.type === "text") {
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
const inResizePoint = (element, x, y) => {
    const points = getResizePoints(element);
    // Check for no resize points of this element
    if (points.length === 0) {
        return null;
    }
    // Check for each resize point
    for (let i = 0; i < points.length; i++) {
        if (points[i].x - resizeRadius <= x && x <= points[i].x + resizeRadius) {
            if (points[i].y - resizeRadius <= y && y <= points[i].y + resizeRadius) {
                return points[i];
            }
        }
    }
    // Default: no resize point found
    return null;
};

// Selection element
const selectionElement = {
    defaultConfig: {
        color: "rgb(78, 145, 228)",
        opacity: 0.1,
    },
    draw: (canvas, element) => {
        canvas.globalAlpha = element.opacity;
        canvas.beginPath();
        canvas.fillStyle = element.color;
        canvas.rect(element.x, element.y, element.width, element.height);
        canvas.fill();
        canvas.globalAlpha = 1; // Reset alpha
    },
    update: () => null,
};

// Rectangle element
const rectangleElement = {
    // icon: "square",
    defaultConfig: {
        fillColor: "transparent",
        fillOpacity: 1.0,
        strokeColor: colors.black,
        strokeWidth: 1,
        strokeDash: false,
        strokeOpacity: 1.0,
        radius: 0,
        textColor: colors.black,
        textOpacity: 1.0,
        textSize: 16,
        textContent: "",
    },
    draw: (canvas, element) => {
        const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
        const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
        const radius = Math.min(element.radius, Math.abs(element.width) / 2, Math.abs(element.height) / 2);
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
        drawInnerText(canvas, element);
        // context.globalAlpha = 1; // Reset opacity
    },
    update: () => null,
};

// Ellipse element
const ellipseElement = {
    // icon: "circle",
    defaultConfig: {
        fillColor: "transparent",
        fillOpacity: 1.0,
        strokeColor: colors.black,
        strokeOpacity: 1.0,
        strokeWidth: 1,
        strokeDash: false,
        textColor: colors.black,
        textOpacity: 1.0,
        textSize: 16,
        textContent: ""
    },
    draw: (canvas, element) => {
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
        drawInnerText(canvas, element);
        // canvas.globalAlpha = 1; //Reset opacity
    },
    update: () => null,
};

// Line element
const lineElement = {
    // icon: "minus",
    defaultConfig: {
        strokeColor: colors.black,
        strokeWidth: 1,
        strokeDash: false,
        strokeOpacity: 1.0,
        lineStart: "none",
        lineEnd: "none",
    },
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
};

// Text element
const textElement = {
    // icon: "text",
    defaultConfig: {
        textAlign: "left",
        textColor: colors.black,
        textSize: 16,
        textFont: "sans-serif", // TODO: get from config
        textOpacity: 1.0,
        textContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    },
    draw: (canvas, element) => {
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
    },
    update: () => null,
};

// Image element
const imageElement = {
    // icon: "image",
    defaultConfig: {
        content: null,
        img: null,
        opacity: 1.0,
    },
    draw: (canvas, element) => {
        canvas.globalAlpha = element.opacity;
        if (element.img !== null) {
            canvas.drawImage(element.img, element.x, element.y, element.width, element.height);
        }
        canvas.globalAlpha = 1; // Reset alpha
    },
    update: () => null,
};

// Screenshot selection element
const screenshotElement = {
    // icon: null,
    defaultConfig: {
        color: "rgb(76, 205, 172)",
        opacity: 0.1,
    },
    draw: (canvas, element) => {
        canvas.globalAlpha = element.opacity;
        canvas.beginPath();
        canvas.fillStyle = element.color;
        canvas.rect(element.x, element.y, element.width, element.height);
        canvas.fill();
        canvas.globalAlpha = 1; //Reset alpha
    },
    update: () => null,
};

// Available elements
const allElements = {
    selection: selectionElement,
    rectangle: rectangleElement,
    ellipse: ellipseElement,
    line: lineElement,
    text: textElement,
    image: imageElement,
    screenshot: screenshotElement,
};

// Get an element by ID
const getElement = name => allElements[name];

// Create a new element
const createElement = options => {
    const el = getElement(options.type);
    return Object.assign({}, el.defaultConfig, options, {
        id: Date.now(), // TODO: replace this
        width: 0,
        height: 0,
        selected: false,
        locked: false,
    });
};

// Update the element
const updateElement = element => {
    return getElement(element.type).update(element); // Call the update method
};

// Draw the provided element
const drawElement = (canvas, element) => {
    return getElement(element.type).draw(canvas, element);
};

// Render element inner text
const drawInnerText = (canvas, element) => {
    if (element.textContent.length === 0 || element.textColor === "transparent") {
        return null; // Nothing to render
    }
    canvas.beginPath();
    // context.font = `${element.textSize}px ${element.textFont}`;
    canvas.font = `${element.textSize}px ${config.fontFamily}`;
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

// Get default configuration
const getDefaultConfig = () => ({
    colors: colors,
    lineCap: lineCapTypes,
    //Selection values
    selectionColor: "rgb(78, 145, 228)",
    selectionOpacity: 0.1,
    // Screenshot value
    screenshotColor: "rgb(76, 205, 172)",
    screenshotOpacity: 0.2,
    // Default grid values
    gridColor: "rgb(238, 242, 247)", 
    gridWidth: 1, //Grid lines width
    gridOpacity: 1.0,
    gridSize: 10,
    gridStyle: "lined",
    // Default resize values
    resizeColor: "rgb(27, 94, 177)",
    resizeWidth: 2, // Resize line width
    resizeOpacity: 1.0,
    // Text configuration
    fontFamily: "sans-serif",
});

// Create client
export const createGitDrawClient = (parent, config) => {
    const ctx = {
        parent: parent,
        config: Object.assign({}, getDefaultConfig(), config),
        listeners: {},
        current: {},
        currentType: "selection",
        currentElement: null,
        currentElementPrevSelected: false,
        currentElementDragging: false,
        currentElementResizing: false,
        selection: [],
        selectionLocked: false, // All selected elements are locked?
        snapshot: [],
        dragged: false,
        resizeOrientation: null,
        cursor: null,
        elements: [],
        width: 200,
        height: 200,
        grid: false,
    };
    // To register event listeners
    ctx.on = (name, fn) => (ctx.listeners[name] = ctx.listeners[name] || []).push(fn);
    ctx.off = (name, fn) => (ctx.listeners[name] || []).filter(f => f !== fn);
    ctx.trigger = (name, args) => (ctx.listeners[name] || []).forEach(fn => fn(args));
    // Export the current board object
    ctx.export = () => {
        return Object.assign({}, ctx.current, {
            elements: ctx.elements.map(element => {
                return Object.assign({}, element, {
                    selected: false,
                });
                // Check for image element --> remove img field
                // if (element.type === "image") {
                //     delete exportedElement.img;
                // }
            }),
            width: ctx.width, // Save current width
            height: ctx.height, // Save current height
        });
    };
    // Grid round
    const gridRound = value => {
        return ctx.grid ? Math.round(value / ctx.config.gridSize) * ctx.config.gridSize : value;
    };
    // Draw the board
    ctx.draw = () => {
        const canvas = ctx.parent.getContext("2d");
        canvas.clearRect(0, 0, ctx.width, ctx.height); //Clear canvas
        //Check for drawing the grid
        //if (state.grid === true) {
        //    context.beginPath();
        //    context.setLineDash([]);
        //    context.strokeStyle = config.gridColor;
        //    context.lineWidth = config.gridWidth; 
        //    //Horizontal rules
        //    for (let i = 0; i * state.gridSize < state.height; i++) {
        //        context.moveTo(0, i * state.gridSize);
        //        context.lineTo(state.width, i * state.gridSize);
        //    }
        //    //Vertical rules
        //    for (let i = 0; i * state.gridSize < state.width; i++) {
        //        context.moveTo(i * state.gridSize, 0);
        //        context.lineTo(i * state.gridSize, state.height);
        //    }
        //    //Draw the grid
        //    context.stroke();
        //}
        // this.elements.forEach(function (element, index) {
        forEachRev(ctx.elements, element => {
            drawElement(canvas, element);
            // Check if this element is selected --> draw selection area
            if (element.selected === true && element.type !== "selection") {
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                canvas.beginPath();
                canvas.setLineDash([8, 4]);
                canvas.strokeStyle = ctx.config.resizeColor; // selectionColor;
                canvas.lineWidth = ctx.config.resizeWidth; // Force line width to 2px
                canvas.rect(xStart, yStart, xEnd - xStart, yEnd - yStart);
                canvas.stroke();
                canvas.setLineDash([]); // Reset line-dash
                // Check if is the unique selected elements
                if (ctx.selection.length === 1 && element.locked === false) {
                    return getResizePoints(element).forEach(point => {
                        canvas.beginPath();
                        canvas.fillStyle = ctx.config.resizeColor; // selectionColor;
                        canvas.arc(point.x, point.y, resizeRadius, 0, 2*Math.PI);
                        canvas.fill();
                    });
                }
            }
        });
    };
    // Clear the board
    ctx.clear = () => {
        ctx.elements = []; // Clear elements
        ctx.selection = []; // Clear selection
        ctx.draw(); // Draw canvas
    };
    // Add a new element
    ctx.addElement = element => {
        Object.assign(element, {
            selected: true, // Set element as selected
            x: gridRound((ctx.width - element.width) / 2),
            y: gridRound((ctx.height - element.height) / 2) 
        });
        ctx.elements.unshift(element); // Save the new element
        ctx.selection = getSelection(ctx.elements); // Update the selection
        // this.forceUpdate(); // Force update to display/hide the stylebar
    };
    // Handle document paste
    const handleDocumentPaste = event => {
        // console.log(event.target);
        // console.log(event.clipboardData);
        // Parse clipboard data
        return !isInputTarget(event) && getDataFromClipboard(event).then(data => {
            // console.log("Copied --> " + type);
            clearSelection(ctx.elements); // Clear the current selection
            parseClipboardBlob(data.type, data.blob).then(content => {
                const newElement = createElement({
                    type: data.type,
                    content: content,
                });
                // Check for not image type
                if (type !== "image") {
                    updateElement(newElement);
                    return ctx.addElement(newElement);
                }
                // Create a new image
                // https://stackoverflow.com/a/4776378
                const img = new Image();
                img.addEventListener("load", () => {
                    return ctx.addElement(Object.assign(newElement, {
                        width: img.width,
                        height: img.height,
                        img: img,
                    }));
                });
                img.src = content; // Set image source
            });
        });
    };
    // Handle document key down
    const handleDocumentKeyDown = event => {
        if (isInputTarget(event)) {
            return; // Stop event processing
        }
        // Check ESCAPE key --> reset selection
        if (event.key === "Escape") {
            event.preventDefault();
            return ctx.resetSelection(); // Reset selection
        }
        // Check for backspace key --> remove elements
        if (event.key === "Backspace") {
            event.preventDefault();
            return ctx.removeSelection();
        }
        // Check for arrow keys --> move elements
        else if (isArrowKey(event.key) === true) {
            event.preventDefault();
            let step = event.shiftKey ? 5 : 1; // Step value
            if (ctx.grid === true) {
                step = ctx.config.gridSize;
            }
            // Move selected elements
            ctx.elements.forEach(element => {
                if (element.selected === true) {
                    if (event.key === "ArrowUp") {
                        element.y = gridRound(element.y - step);
                    }
                    else if (event.key === "ArrowDown") {
                        element.y = gridRound(element.y + step);
                    }
                    else if (event.key === "ArrowLeft") {
                        element.x = gridRound(element.x - step);
                    }
                    else if (event.key === "ArrowRight") {
                        element.x = gridRound(element.x + step);
                    }
                }
            });
            return ctx.draw();
        }
    };
    // Handle mouse down
    const handleMouseDown = event => {
        ctx.lastX = event.offsetX; // event.clientX - event.target.offsetLeft;
        ctx.lastY = event.offsetY; // event.clientY - event.target.offsetTop;
        // console.log(`x: ${ctx.lastX}, y: ${ctx.lastY}`);
        // Reset drag state values
        ctx.currentElement = null;
        ctx.currentElementPrevSelected = false;
        ctx.currentElementDragging = false;
        ctx.currentElementResizing = false;
        ctx.dragged = false;
        // ctx.cursor = null; //Reset cursor
        // ctx.selectionCount = 0; //Clear number of selected elements
        //Check if we are in a resize point
        if (ctx.selection.length === 1) {
            const point = inResizePoint(ctx.selection[0], ctx.lastX, ctx.lastY);
            if (point !== null) {
                ctx.currentElement = ctx.selection[0]; // Save current element
                ctx.resizeOrientation = point.orientation; // Save resize orientation
                ctx.currentElementResizing = true; // Resizing element
                ctx.snapshot = snapshotSelection(ctx.selection); // Create a snapshot of the selection
                return; // Stop event
            }
        }
        // Check the selected type
        if (ctx.currentType === "selection") {
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
                ctx.currentElementPrevSelected = el.selected; // Save if element is already selected
                ctx.currentElementDragging = true;
                // Check if this element is not selected
                if (el.selected === false && !event.shiftKey) {
                    clearSelection(ctx.elements); // Remove other elements
                }
                // Toggle selection
                el.selected = true;
                // this.state.hasSelection = true; // At least has one selected element
                ctx.selection = getSelection(ctx.elements);
                ctx.snapshot = snapshotSelection(ctx.selection); // Create a snapshot of the selection
                ctx.selectionLocked = isSelectionLocked(ctx.selection); // Save is selection is locked
                // this.renderStatusSelection();
                return; // Stop event
            }
        }
        // Create a new element
        const element = createElement({
            type: ctx.currentType,
            x: gridRound(ctx.lastX), 
            y: gridRound(ctx.lastY),
        });
        // this.elements.push(element);
        ctx.elements.unshift(element);
        ctx.currentElement = element; // Save dragging element
        ctx.selection = []; // Clear the current selection
        clearSelection(ctx.elements);
        // this.forceUpdate(); // Force update to hide stylebar
    };
    // Handle mouse move
    const handleMouseMove = event => {
        const x = event.offsetX; // event.clientX - event.target.offsetLeft;
        const y = event.offsetY; // event.clientY - event.target.offsetTop;
        // Set mouse position
        // this.renderStatusPosition(x, y);
        // Check for no selected elements
        if (ctx.currentElement === null) {
            return;
        }
        ctx.dragged = true;
        // Check if we are resizing the element
        if (ctx.currentElementResizing === true) {
            if (ctx.currentElement.locked === true) {
                return null; // Element is locked
            }
            const element = ctx.currentElement;
            const snapshot = ctx.snapshot[0]; // Get snapshot of the current element
            const orientation = ctx.resizeOrientation;
            const deltaX = gridRound(x - ctx.lastX);
            const deltaY = gridRound(y - ctx.lastY);
            // Check the orientation
            if (orientation === "rh") {
                element.width = snapshot.width + deltaX;
            }
            else if (orientation === "lh") {
                element.x = snapshot.x + deltaX;
                element.width = snapshot.width - deltaX;
            }
            else if (orientation === "bv") {
                element.height = snapshot.height + deltaY;
            }
            else if (orientation === "tv") {
                element.y = snapshot.y + deltaY;
                element.height = snapshot.height - deltaY;
            }
            else if (orientation === "ltd") {
                element.x = snapshot.x + deltaX;
                element.y = snapshot.y + deltaY;
                element.width = snapshot.width - deltaX;
                element.height = snapshot.height - deltaY;
            }
            else if (orientation === "rtd") {
                element.y = snapshot.y + deltaY;
                element.width = snapshot.width + deltaX;
                element.height = snapshot.height - deltaY;
            }
            else if (orientation === "lbd") {
                element.x = snapshot.x + deltaX;
                element.width = snapshot.width - deltaX;
                element.height = snapshot.height + deltaY;
            }
            else if (orientation === "rbd") {
                element.width = snapshot.width + deltaX;
                element.height = snapshot.height + deltaY;
            }
            // Display in status bar
            // this.renderStatusAction(`resize:${element.type}:${Math.abs(element.width)}x${Math.abs(element.height)}`);
        }
        // Check if we have selected elements
        else if (ctx.currentElementDragging === true && ctx.selection.length > 0) {
            if (ctx.selectionLocked) {
                return null; // Move is not allowed --> selection is locked
            }
            const incrementX = x - ctx.lastX;
            const incrementY = y - ctx.lastY;
            // Move all elements
            ctx.selection.forEach((element, index) => {
                if (!element.locked) {
                    element.x = gridRound(ctx.snapshot[index].x + incrementX);
                    element.y = gridRound(ctx.snapshot[index].y + incrementY);
                }
            });
            // Render in status bar
            // this.renderStatusAction(`move::selection: ${Math.abs(incrementX)},${Math.abs(incrementY)}`);
        }
        // Check if we have a drag element
        else if (ctx.currentElement !== null) {
            const element = ctx.currentElement;
            // Check for text element
            // if (element.type === "text") {
            //     Object.assign(element, {"x": x, "y": y}); //Update only text position
            // }
            const deltaX = gridRound(x - element.x);
            //let deltaY = this.gridRound(y - element.y);
            element.width = deltaX;
            element.height = event.shiftKey ? deltaX : gridRound(y - element.y);
            // Check if the elemement is a selection
            if (element.type === "selection") {
                // Set selected elements and get the new number of selected elements
                setSelection(element, ctx.elements);
                // this.renderStatusAction(`selection:${Math.abs(element.width)}x${Math.abs(element.height)}`);
            }
            // else if (element.type === "screenshot") {
            //     // this.renderStatusAction(`screenshot:${Math.abs(element.width)}x${Math.abs(element.height)}`);
            // }
            // else {
            //     // this.renderStatusAction(`draw:${element.type}:${Math.abs(element.width)}x${Math.abs(element.height)}`);
            // }
        }
        // Update
        ctx.draw();
    };
    // Handle mouse up
    const handleMouseUp = event => {
        // Check for no current element active
        if (ctx.currentElement === null) {
            return;
        }
        // Check for resizing
        // if (this.view.currentElementResizing === true) {
        //     delete this.view.currentElement.resizing; //Remove resizing attribute
        // }
        // Check for clicked element
        if (ctx.dragged === false && ctx.selection.length > 0) {
            if (ctx.currentElementPrevSelected === true && event.shiftKey) {
                // clearSelection(this.elements);
                ctx.currentElement.selected = false;
            }
            // Check if no shift key is pressed --> keep only this current element in selection
            else if (!event.shiftKey) {
                clearSelection(ctx.elements); // Remove other elements from selection
                ctx.currentElement.selected = true;
            }
        }
        // Check for adding a new element
        if (ctx.currentType !== "selection" && ctx.currentType !== "screenshot") {
            ctx.currentElement.selected = true; // Set the new element as selected
            updateElement(ctx.currentElement); // Update the current element
        }
        // Remove selection elements
        ctx.elements = ctx.elements.filter(element => {
            return element.type !== "selection" && element.type !== "screenshot";
        });
        // Check for screenshot element
        if (ctx.currentType === "screenshot") {
            // Calculate absolute positions
            const [xStart, xEnd] = getAbsolutePositions(ctx.currentElement.x, ctx.currentElement.width);
            const [yStart, yEnd] = getAbsolutePositions(ctx.currentElement.y, ctx.currentElement.height);
            // Process the screenshot
            ctx.trigger("screenshot", {
                x: xStart,
                width: xEnd - xStart,
                y: yStart,
                height: yEnd - yStart,
            });
        }
        // Change the current type to selection
        if (ctx.currentType !== "selection") {
            ctx.currentType = "selection";
        }
        // Reset the current drag element
        ctx.currentElement = null;
        ctx.selection = getSelection(ctx.elements); // Update the selection
        ctx.selectionLocked = isSelectionLocked(ctx.selection); // Update is selection is locked
        // this.renderStatusAction(""); //Reset status action
        // this.forceUpdate(); //Force update to display/hide the stylebar
        // Draw
        ctx.draw();
    };
    // Handle resize --> update the canvas width and height
    ctx.resize = () => {
        ctx.width = ctx.parent.parentElement.offsetWidth;
        ctx.height = ctx.parent.parentElement.offsetHeight;
        // Update canvas size
        ctx.parent.setAttribute("width", ctx.width + "px");
        ctx.parent.setAttribute("height", ctx.height + "px");
        // TODO: force an update
    };
    // Handle type change 
    ctx.setCurrentType = type => {
        clearSelection(ctx.elements); // Remove selection
        ctx.selection = []; // Reset selection 
        ctx.currentType = type;
        ctx.draw();
        // TODO: force an update
    };
    // Handle grid toggle --> Display or hide the grid
    ctx.toggleGrid = () => {
        ctx.grid = !ctx.grid;
        ctx.draw();
        // TODO: force an update
    };
    // Handle selection update
    ctx.updateSelection = (key, value) => {
        ctx.selection.forEach(element => {
            element[key] = value; // Update the element key
            updateElement(element); // Update the element
        });
        // TODO: force an update
        ctx.draw();
    };
    // Clone the current selection
    ctx.cloneSelection = () => {
        const newElements = [];
        // Update the selection with the cloned elements
        ctx.selection = ctx.selection.map(element => {
            const clonedElement = Object.assign({}, element, {
                x: element.x + 10,
                y: element.y + 10,
                locked: false, // Reset locked attribute
            });
            newElements.push(clonedElement); // Save to the elements list
            element.selected = false; // Remove this element from selection
            return clonedElement; // Add to selection
        });
        // Add new elements
        forEachRev(newElements, el => ctx.elements.unshift(el));
        ctx.selectionLocked = false; // Reset selection locked flag
        //this.renderStatusSelection(); // Update status selection
        // TODO: force an update
        ctx.draw();
    };
    // Remove current selection
    ctx.removeSelection = () => {
        // Remove current selection
        ctx.elements = ctx.elements.filter(element => !element.selected);
        ctx.selection = []; // Remove selection
        // this.renderStatusSelection(); //Update status selection
        // TODO: force an update
        ctx.draw();
    };
    // Reorder the selection
    ctx.orderSelection = position => {
        const elements = ctx.elements;
        // ctx.selection.forEach(function (element) {
        forEachRev(ctx.selection, selectedEl => {
            const index = elements.findIndex(el => el.id === selectedEl.id);
            // TODO: check for not found element????
            // Move the elment to back
            if (position === "back" && index + 1 < elements.length) {
                elements.splice(index, 0, elements.splice(index + 1, 1)[0]);
            }
            // Move the element to front
            else if (position === "front" && index - 1 >= 0) {
                elements.splice(index, 0, elements.splice(index - 1, 1)[0]);
            }
        });
        ctx.draw(); // Only draw
    };
    // Toggle selection lock
    ctx.toggleSelectionLock = () => {
        if (ctx.selectionLocked === true) {
            unlockElements(ctx.selection);
        }
        else {
            lockElements(ctx.selection);
        }
        // Toggle selection locked
        ctx.selectionLocked = !ctx.selectionLocked;
        // TODO: force update
    };
    // Reset the selection
    ctx.resetSelection = () => {
        ctx.elements.forEach(element => {
            element.selected = false; // Set selected as false
        });
        ctx.selection = []; // Clear selection list
        ctx.draw();
        // TODO: force update
    };
    // Initialize
    ctx.init = () => {
        // Register event listeners
        parent.addEventListener("mousedown", handleMouseDown);
        parent.addEventListener("mousemove", handleMouseMove);
        parent.addEventListener("mouseup", handleMouseUp);
        // Register document event listener
        document.addEventListener("keydown", handleDocumentKeyDown, false);
        document.addEventListener("paste", handleDocumentPaste, false);
        window.addEventListener("resize", ctx.resize, false);
        ctx.resize(); // Update the canvas with the correct size
    };
    // Remove all event listeners
    ctx.destroy = () => {
        //Remove canvas listeners
        parent.removeEventListener("mousedown", handleMouseDown);
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseup", handleMouseUp);
        //Remove window/document listeners
        document.removeEventListener("keydown", handleDocumentKeyDown, false);
        document.removeEventListener("paste", handleDocumentPaste, false);
        window.removeEventListener("resize", ctx.resize, false);
    };
    ctx.init();
    // Return context instance
    return ctx;
};
