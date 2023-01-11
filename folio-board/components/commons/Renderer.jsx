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
import {useEvents} from "../../hooks/useEvents.js";
import {boardStyles} from "../../styles.js";

export const Renderer = () => {
    const board = useBoard();
    const events = useEvents({
        onScreenshot: region => {
            return exportToClipboard({
                elements: board.current.getElements(),
                fonts: Object.values(FONT_FACES),
                crop: region,
            });
        },
    });
    // const action = board.current.state.activeAction;
    const isSelection = board.current.activeAction === ACTIONS.SELECT;
    const isScreenshot = board.current.activeAction === ACTIONS.SCREENSHOT;

    return (
        <Canvas
            id={board.current.id}
            elements={board.current.elements}
            assets={board.current.assets}
            styles={boardStyles}
            backgroundColor="#fafafa"
            translateX={board.current.translateX}
            translateY={board.current.translateY}
            zoom={board.current.zoom}
            brush={board.current.selection}
            brushFillColor={isScreenshot ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
            brushStrokeColor={isScreenshot ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
            showHandlers={!board.current.activeAction && !board.current.activeTool}
            showBrush={isSelection || isScreenshot}
            showBounds={!board.current.activeAction && !board.current.activeTool}
            showGrid={true}
            {...events}
        />
    );
};
