import React from "react";
import {Canvas} from "folio-core";
import {
    SCREENSHOT_FILL_COLOR,
    SCREENSHOT_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
    exportToClipboard,
} from "folio-core";
import {ACTIONS, FONT_FACES} from "../../constants.js";

import {useBoard} from "../../contexts/BoardContext.jsx";
import {useToasts} from "../../contexts/ToastContext.jsx";
import {useEvents} from "../../hooks/useEvents.js";
import {boardStyles} from "../../styles.js";

export const Renderer = () => {
    const board = useBoard();
    const toasts = useToasts();
    const events = useEvents({
        onScreenshot: region => {
            const exportOptions = {
                elements: board.getElements(),
                fonts: Object.values(FONT_FACES),
                crop: region,
            };
            return exportToClipboard(exportOptions).then(() => {
                toasts.add("Screenshot copied to clipboard.");
            });
        },
    });
    const isSelection = board.activeAction === ACTIONS.SELECT;
    const isScreenshot = board.activeAction === ACTIONS.SCREENSHOT;

    return (
        <Canvas
            id={board.id}
            elements={board.elements}
            assets={board.assets}
            styles={boardStyles}
            backgroundColor="#fafafa"
            translateX={board.translateX}
            translateY={board.translateY}
            zoom={board.zoom}
            brush={board.selection}
            brushFillColor={isScreenshot ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
            brushStrokeColor={isScreenshot ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
            showHandlers={!board.activeAction && !board.activeTool}
            showBrush={isSelection || isScreenshot}
            showBounds={!board.activeAction && !board.activeTool}
            showGrid={true}
            {...events}
        />
    );
};
