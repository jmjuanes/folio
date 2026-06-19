import { ZOOM_MAX, ZOOM_MIN } from "../constants.js";
import { getElementsBoundingRectangle } from "./elements.js";

export type CameraView = {
    zoom: number;
    translateX: number;
    translateY: number;
};

export const parseZoomValue = (value: number): number => {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
};

// @description get transform coordinates for the new zoom value
// @param {number} value New zoom value
// @param {number} editor.translateX Previous translate X coordinate
// @param {number} editor.translateY Previous translate Y coordinate
// @param {number} editor.zoom Previous zoom value
// @param {number} editor.width Width value of the current editor
// @param {number} editor.height Height value of the current editor
export const getTranslateCoordinatesForNewZoom = (value: number, width: number, height: number, currentView: CameraView): CameraView => {
    return {
        zoom: value,
        translateX: Math.floor(width / 2 - (width / 2 - currentView.translateX) * value / currentView.zoom),
        translateY: Math.floor(height / 2 - (height / 2 - currentView.translateY) * value / currentView.zoom),
    };
};

// @description get transform coordinates for a new zoom value centred on a specific screen point
// @param {number} value New zoom value
// @param {number} pointX Screen X coordinate of the focal point (e.g. cursor or pinch midpoint)
// @param {number} pointY Screen Y coordinate of the focal point
// @param {CameraView} currentView Current camera state (zoom, translateX, translateY)
export const getTranslateCoordinatesForZoomAtPoint = (value: number, pointX: number, pointY: number, currentView: CameraView): CameraView => {
    const newZoom = parseZoomValue(value);
    // The world point under the focal screen point must stay fixed after the zoom.
    // worldX = (pointX - translateX) / zoom  →  newTranslateX = pointX - worldX * newZoom
    const worldX = (pointX - currentView.translateX) / currentView.zoom;
    const worldY = (pointY - currentView.translateY) / currentView.zoom;
    return {
        zoom: newZoom,
        translateX: Math.floor(pointX - worldX * newZoom),
        translateY: Math.floor(pointY - worldY * newZoom),
    };
};

// @description get zoom level and transform coordinates to fit the provided elements into the viewport
// @param {Array} elements Array of elements to fit into the viewport
// @param {number} editor.width Width value of the current editor
// @param {number} editor.height Height value of the current editor
export const getZoomToFitElements = (elements = [], width: number, height: number): CameraView => {
    const bounds = getElementsBoundingRectangle(elements);
    const boundsWidth = bounds[1][0] - bounds[0][0]; // width of the bounding box
    const boundsHeight = bounds[1][1] - bounds[0][1]; // height of the bounding box
    const zoom = parseZoomValue(Math.min(width / boundsWidth, height / boundsHeight));
    return {
        zoom: zoom,
        translateX: -(bounds[0][0] + boundsWidth / 2) * zoom + width / 2,
        translateY: -(bounds[0][1] + height / 2) * zoom + height / 2,
    };
};
