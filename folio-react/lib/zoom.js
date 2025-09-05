import {ZOOM_MAX, ZOOM_MIN} from "../constants.js";
import {getRectangleBounds} from "../utils/math.ts";

export const parseZoomValue = value => {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
};

// @description get transform coordinates for the new zoom value
// @param {number} value New zoom value
// @param {number} editor.translateX Previous translate X coordinate
// @param {number} editor.translateY Previous translate Y coordinate
// @param {number} editor.zoom Previous zoom value
// @param {number} editor.width Width value of the current editor
// @param {number} editor.height Height value of the current editor
export const getTranslateCoordinatesForNewZoom = (value, editor) => {
    const delta = editor.zoom - value;
    return {
        translateX: Math.floor(editor.translateX + editor.width * delta / 2),
        translateY: Math.floor(editor.translateY + editor.height * delta / 2),
    };
};

// @description get zoom level and transform coordinates to fit the provided elements into the viewport
// @param {Array} elements Array of elements to fit into the viewport
// @param {number} editor.width Width value of the current editor
// @param {number} editor.height Height value of the current editor
export const getZoomToFitElements = (elements = [], editor) => {
    const bounds = getRectangleBounds(elements);
    const width = bounds.x2 - bounds.x1; // width of the bounding box
    const height = bounds.y2 - bounds.y1; // height of the bounding box
    const zoom = parseZoomValue(Math.min(editor.width / width, editor.height / height));
    return {
        zoom: zoom,
        translateX: -(bounds.x1 + width / 2) * zoom + editor.width / 2,
        translateY: -(bounds.y1 + height / 2) * zoom + editor.height / 2,
    };
};
