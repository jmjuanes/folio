import React from "react";
import {Canvas} from "folio-core";

import {SELECTION_FILL_COLOR, SELECTION_STROKE_COLOR} from "../constants.js";
import {SELECT_BOUNDS_FILL_COLOR, SELECT_BOUNDS_STROKE_COLOR} from "../constants.js";
import {ACTIONS} from "../constants.js";

import {useBoard} from "../contexts/BoardContext.jsx";
import {useEvents} from "../hooks/useEvents.js";
import {useCursor} from "../hooks/useCursor.js";
import {useBounds} from "../hooks/useBounds.js";
import {useHandlers} from "../hooks/useHandlers.js";

export const Renderer = props => {
    const board = useBoard();
    const events = useEvents({
        onChange: props.onChange,
        onScreenshot: props.onScreenshot,
    });
    const cursor = useCursor();
    const bounds = useBounds();
    const handlers = useHandlers();

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
            bounds={bounds}
            boundsFillColor={SELECT_BOUNDS_FILL_COLOR}
            boundsStrokeColor={SELECT_BOUNDS_STROKE_COLOR}
            showBounds={!!bounds}
            handlers={handlers}
            showEdgeHandlers={handlers?.showEdgeHandlers}
            showCornerHandlers={handlers?.showCornerHandlers}
            showNodeHandlers={handlers?.showNodeHandlers}
            brush={board.selection}
            brushFillColor={SELECTION_FILL_COLOR}
            brushStrokeColor={SELECTION_STROKE_COLOR}
            showBrush={board.activeAction === ACTIONS.SELECT}
            pointer={board.erase}
            showPointer={board.activeAction === ACTIONS.ERASE}
            showGrid={board.grid}
            {...events}
        />
    );
};
