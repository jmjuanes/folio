import React from "react";
import {
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
    SELECT_BOUNDS_FILL_COLOR,
    SELECT_BOUNDS_STROKE_COLOR,
    ACTIONS,
} from "@lib/constants.js";
import {useBoard} from "@components/contexts/board.jsx";
import {useEvents} from "@hooks/use-events.js";
import {useCursor} from "@hooks/use-cursor.js";
import {useBounds} from "@hooks/use-bounds.js";
import {useHandlers} from "@hooks/use-handlers.js";
import {Canvas} from "@components/render/canvas.jsx";

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
            brush={board.selection}
            brushFillColor={SELECTION_FILL_COLOR}
            brushStrokeColor={SELECTION_STROKE_COLOR}
            showBrush={board.activeAction === ACTIONS.SELECT || board.activeAction === ACTIONS.SCREENSHOT}
            pointer={board.erase}
            showPointer={board.activeAction === ACTIONS.ERASE}
            showGrid={board.grid}
            {...events}
        />
    );
};
