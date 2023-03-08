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
import {useCursor} from "../../hooks/useCursor.js";

export const Renderer = props => {
    const board = useBoard();
    const action = board.activeAction;
    const events = useEvents({
        onChange: props.onChange,
        onScreenshot: props.onScreenshot,
    });
    const cursor = useCursor();
    const isSelection = board.activeAction === ACTIONS.SELECT;
    const isScreenshot = board.activeAction === ACTIONS.SCREENSHOT;
    const showHandlersAndBounds = !board.activeTool && (!action || action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE);

    return (
        <Canvas
            id={board.id}
            elements={board.elements}
            assets={board.assets}
            backgroundColor={board.background}
            cursor={cursor}
            translateX={board.translateX}
            translateY={board.translateY}
            zoom={board.zoom}
            brush={board.selection}
            brushFillColor={isScreenshot ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
            brushStrokeColor={isScreenshot ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
            showBrush={isSelection || isScreenshot}
            showHandlers={showHandlersAndBounds}
            showBounds={showHandlersAndBounds}
            showGrid={true}
            {...events}
        />
    );
};
