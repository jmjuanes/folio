import React from "react";
import {ZOOM_MIN, ZOOM_MAX} from "@lib/constants.js";
import {withBoard} from "@components/contexts/board.jsx";
import {HeaderContainer, HeaderButton} from "@components/commons/header.jsx";

export const Zooming = withBoard((props, board) => (
    <HeaderContainer>
        <HeaderButton
            icon="zoom-out"
            roundedEnd={false}
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
            roundedStart={false}
            disabled={ZOOM_MAX <= board.zoom}
            onClick={props.onZoomInClick}
        />
    </HeaderContainer>
));

Zooming.defaultProps = {
    onZoomInClick: null,
    onZoomOutClick: null,
};
