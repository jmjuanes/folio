import {ZOOM_MAX, ZOOM_MIN} from "./constants.js";

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
