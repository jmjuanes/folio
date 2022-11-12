import React from "react";
import {
    OPACITY_NONE,
    RADIUS_NONE,
    STROKE_STYLE_SOLID,
} from "../constants.js";

export const useBoardState = () => {
    return React.useRef({
        action: null,
        activeTool: null,
        activeElement: null,
        activeHandler: null,
        isResized: false,
        isDragged: false,
        selectionCount: 0,
        brush: null,
        snapshot: null,
        zoom: 1,
        showStyleDialog: true,
        showExportDialog: false,
        defaults: {
            fillOpacity: OPACITY_NONE,
            radius: RADIUS_NONE,
            strokeStyle: STROKE_STYLE_SOLID,
        },
    });
};
