import React from "react";
import {
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
        brush: null,
        snapshot: null,
        zoom: 1,
        translate: {
            x: 0,
            y: 0,
            lastX: 0,
            lastY: 0,
        },
        showStyleDialog: true,
        showExportDialog: false,
        defaults: {
            fillOpacity: OPACITY_NONE,
            radius: RADIUS_NONE,
            strokeStyle: STROKE_STYLE_SOLID,
            textSize: DEFAULT_FONT_SIZE,
            textFont: DEFAULT_FONT_FAMILY,
        },
    });
};
