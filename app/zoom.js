import {ZOOM_MAX, ZOOM_MIN} from "./constants.js";
import {getRectangleBounds} from "./utils/math.js";

export const parseZoomValue = value => {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
};

// @description get transform coordinates for the new zoom value
// @param {number} value New zoom value
// @param {number} scene.translateX Previous translate X coordinate
// @param {number} scene.translateY Previous translate Y coordinate
// @param {number} scene.zoom Previous zoom value
// @param {number} scene.width Width value of the current scene
// @param {number} scene.height Height value of the current scene
export const getTranslateCoordinatesForNewZoom = (value, scene) => {
    const delta = scene.zoom - value;
    return {
        translateX: Math.floor(scene.translateX + scene.width * delta / 2),
        translateY: Math.floor(scene.translateY + scene.height * delta / 2),
    };
};

// @description get zoom level and transform coordinates to fit the provided elements into the viewport
// @param {Array} elements Array of elements to fit into the viewport
// @param {number} scene.width Width value of the current scene
// @param {number} scene.height Height value of the current scene
export const getZoomToFitElements = (elements = [], scene) => {
    const bounds = getRectangleBounds(elements);
    const width = bounds.x2 - bounds.x1; // width of the bounding box
    const height = bounds.y2 - bounds.y1; // height of the bounding box
    const zoom = parseZoomValue(Math.min(scene.width / width, scene.height / height));
    return {
        zoom: zoom,
        translateX: -(bounds.x1 + width / 2) * zoom + scene.width / 2,
        translateY: -(bounds.y1 + height / 2) * zoom + scene.height / 2,
    };
};
