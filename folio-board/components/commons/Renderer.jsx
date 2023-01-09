import React from "react";
import {Canvas} from "folio-core";
import {
    SCREENSHOT_FILL_COLOR,
    SCREENSHOT_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
} from "folio-core";
import {ACTIONS} from "../../constants.jsx";

import {useBoard} from "../../contexts/BoardContext.jsx";
import {useEvents} from "../../hooks/useEvents.jsx";
import {boardStyles} from "../../styles.js";

export const Renderer = () => {
    const board = useBoard();
    const events = useEvents();
    // const action = board.current.state.activeAction;
    const isSelection = board.current.state.activeAction === ACTIONS.SELECT;
    const isScreenshot = board.current.state.activeAction === ACTIONS.SCREENSHOT;

    return (
        <Canvas
            key={board.current.state.showExport || board.current.state.showSettings}
            id={board.current.id}
            elements={board.current.elements}
            assets={board.current.assets}
            styles={boardStyles}
            backgroundColor={board.current.state.background}
            translateX={board.current.state.translateX}
            translateY={board.current.state.translateY}
            zoom={board.current.state.zoom}
            brush={board.current.state.selection}
            brushFillColor={isScreenshot ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
            brushStrokeColor={isScreenshot ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
            showHandlers={!board.current.state.activeAction && !board.current.state.activeTool}
            showBrush={isSelection || isScreenshot}
            showBounds={!board.current.state.activeAction && !board.current.state.activeTool}
            showGrid={true}
            {...events}
        />
    );
};
