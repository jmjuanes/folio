import React from "react";
import {
    DEFAULT_COLOR_FILL,
    DEFAULT_COLOR_STROKE,
    DEFAULT_COLOR_TEXT,
    DEFAULT_FONT_FAMILY,
    DEFAULT_FONT_SIZE,
    OPACITY_NONE,
    RADIUS_NONE,
    STROKE_STYLE_SOLID,
} from "../constants.js";

export const useBoardState = () => {
    return React.useRef({
        action: null,
        tool: null,
        activeElement: null,
        activeHandler: null,
        isResized: false,
        isDragged: false,
        selectionCount: 0,
        brush: {
            width: 0,
            height: 0,
        },
        snapshot: null,
        zoom: 1,
        translate: {
            x: 0,
            y: 0,
            lastX: 0,
            lastY: 0,
        },
        showStyleDialog: false,
        showExportDialog: false,
        defaults: {
            fillColor: DEFAULT_COLOR_FILL,
            fillOpacity: OPACITY_NONE,
            radius: RADIUS_NONE,
            strokeColor: DEFAULT_COLOR_STROKE,
            strokeStyle: STROKE_STYLE_SOLID,
            textColor: DEFAULT_COLOR_TEXT,
            textSize: DEFAULT_FONT_SIZE,
            textFont: DEFAULT_FONT_FAMILY,
        },
    });
};
