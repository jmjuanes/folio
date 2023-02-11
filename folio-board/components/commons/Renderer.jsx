import React from "react";
import {Canvas} from "folio-core";
import {
    SCREENSHOT_FILL_COLOR,
    SCREENSHOT_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
} from "folio-core";
import {ACTIONS} from "../../constants.js";

import {useBoard} from "../../contexts/BoardContext.jsx";
import {useEvents} from "../../hooks/useEvents.js";

export const Renderer = props => {
    const board = useBoard();
    const events = useEvents({
        onChange: props.onChange,
        onScreenshot: props.onScreenshot,
    });
    const isSelection = board.activeAction === ACTIONS.SELECT;
    const isScreenshot = board.activeAction === ACTIONS.SCREENSHOT;

    return (
        <Canvas
            id={board.id}
            elements={board.elements}
            assets={board.assets}
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
