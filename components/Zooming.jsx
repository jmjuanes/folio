import React from "react";
import {ZOOM_MIN, ZOOM_MAX} from "../constants.js";
import {withBoard} from "../contexts/BoardContext.jsx";
import {HeaderContainer, HeaderButton} from "./HeaderCommons.jsx";

export const Zooming = withBoard((props, board) => (
    <HeaderContainer>
        <HeaderButton
            icon="zoom-out"
            disabled={board.zoom <= ZOOM_MIN}
            onClick={props.onZoomOutClick}
        />
        <div className="flex items-center justify-center w-12 h-full select-none">
            <span className="text-xs text-center">
                {(board.zoom * 100).toFixed(0)}%
            </span>
        </div>
        <HeaderButton
            icon="zoom-in"
            disabled={ZOOM_MAX <= board.zoom}
            onClick={props.onZoomInClick}
        />
    </HeaderContainer>
));

Zooming.defaultProps = {
    onZoomInClick: null,
    onZoomOutClick: null,
};
