import {RESIZE_TYPES, RESIZE_ORIENTATIONS} from "../constants.js";
import {getAbsolutePositions} from "../utils/math.js";

// Inverse resize orientations
const inverseResizeOrientations = {
    [RESIZE_ORIENTATIONS.LEFT_TOP]: [RESIZE_ORIENTATIONS.RIGHT_BOTTOM, RESIZE_ORIENTATIONS.RIGHT_TOP, RESIZE_ORIENTATIONS.LEFT_BOTTOM],
    [RESIZE_ORIENTATIONS.LEFT_BOTTOM]: [RESIZE_ORIENTATIONS.RIGHT_TOP, RESIZE_ORIENTATIONS.RIGHT_BOTTOM, RESIZE_ORIENTATIONS.LEFT_TOP],
    [RESIZE_ORIENTATIONS.RIGHT_TOP]: [RESIZE_ORIENTATIONS.LEFT_BOTTOM, RESIZE_ORIENTATIONS.LEFT_TOP, RESIZE_ORIENTATIONS.RIGHT_BOTTOM],
    [RESIZE_ORIENTATIONS.RIGHT_BOTTOM]: [RESIZE_ORIENTATIONS.LEFT_TOP, RESIZE_ORIENTATIONS.LEFT_BOTTOM, RESIZE_ORIENTATIONS.RIGHT_TOP],
    [RESIZE_ORIENTATIONS.LEFT]: [RESIZE_ORIENTATIONS.RIGHT, RESIZE_ORIENTATIONS.RIGHT, RESIZE_ORIENTATIONS.LEFT],
    [RESIZE_ORIENTATIONS.RIGHT]: [RESIZE_ORIENTATIONS.LEFT, RESIZE_ORIENTATIONS.LEFT, RESIZE_ORIENTATIONS.RIGHT],
    [RESIZE_ORIENTATIONS.TOP]: [RESIZE_ORIENTATIONS.BOTTOM, RESIZE_ORIENTATIONS.TOP, RESIZE_ORIENTATIONS.BOTTOM],
    [RESIZE_ORIENTATIONS.BOTTOM]: [RESIZE_ORIENTATIONS.TOP, RESIZE_ORIENTATIONS.BOTTOM, RESIZE_ORIENTATIONS.TOP],
};

export const getResizePoints = (element, offset) => {
    const [x0, x1] = getAbsolutePositions(element.x, element.width);
    const [y0, y1] = getAbsolutePositions(element.y, element.height);
    if (element.resize === RESIZE_TYPES.ALL) {
        return [
            {
                orientation: RESIZE_ORIENTATIONS.LEFT_TOP,
                x: x0 - offset,
                y: y0 - offset,
                xs: -1,
                ys: -1,
            },
            {
                orientation: RESIZE_ORIENTATIONS.TOP,
                x: (x0 + x1) / 2,
                y: y0 - offset,
                xs: -0.5,
                ys: -1,
            },
            {
                orientation: RESIZE_ORIENTATIONS.RIGHT_TOP,
                x: x1 + offset,
                y: y0 - offset,
                xs: 0,
                ys: -1,
            },
            {
                orientation: RESIZE_ORIENTATIONS.LEFT,
                x: x0 - offset,
                y: (y0 + y1) / 2,
                xs: -1,
                ys: -0.5,
            },
            {
                orientation: RESIZE_ORIENTATIONS.RIGHT,
                x: x1 + offset,
                y: (y0 + y1) / 2,
                xs: 0,
                ys: -0.5,
            },
            {
                orientation: RESIZE_ORIENTATIONS.LEFT_BOTTOM,
                x: x0 - offset,
                y: y1 + offset,
                xs: -1,
                ys: 0,
            },
            {
                orientation: RESIZE_ORIENTATIONS.RIGHT_BOTTOM,
                x: x1 + offset,
                y: y1 + offset,
                xs: 0,
                ys: 0,
            },
            {
                orientation: RESIZE_ORIENTATIONS.BOTTOM,
                x: (x0 + x1) / 2,
                y: y1 + offset,
                xs: -0.5,
                ys: 0,
            },
        ];
    }
    else if (element.resize === RESIZE_TYPES.MAIN_DIAGONAL) {
        return [
            {
                orientation: RESIZE_ORIENTATIONS.LEFT_TOP,
                x: x0 - offset,
                y: y0 - offset,
                xs: -1,
                ys: -1,
            },
            {
                orientation: RESIZE_ORIENTATIONS.RIGHT_BOTTOM,
                x: x1 + offset,
                y: y1 + offset,
                xs: 0,
                ys: 0,
            },
        ];
    }
    // Default: no resize points
    return [];
};

// Check if the cursor is inside a resize point
export const inResizePoint = (element, x, y, size, offset) => {
    return getResizePoints(element, offset).find(point => {
        const px = point.x + point.xs * size;
        const py = point.y + point.ys * size;
        return px <= x && x <= px + size && py <= y && y <= py + size;
    });
};

// Fix resize orientation
export const fixResizeOrientation = (element, orientation) => {
    if (element.width < 0 && element.height < 0) {
        return inverseResizeOrientations[orientation][0];
    } else if (element.width < 0) {
        return inverseResizeOrientations[orientation][1];
    } else if (element.height < 0) {
        return inverseResizeOrientations[orientation][2];
    }
    return orientation;
};
