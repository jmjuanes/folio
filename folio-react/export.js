import {createCanvas, screenshotCanvas} from "./utils/canvas.js";
import {getOuterRectangle} from "./utils/math.js";
import {drawBoard} from "./draw.js";

export const exportToBlob = opt => {
    const size = getOuterRectangle(opt.elements);
    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext("2d");
    if (opt.backgroundColor) {
        ctx.fillStyle = opt.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawBoard(canvas, opt.elements, null, {
        clear: false,
        translateX: -size.x,
        translateY: -size.y,
        zoom: 1,
    });
    return screenshotCanvas(canvas);
};

