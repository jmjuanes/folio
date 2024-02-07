import React from "react";
import {ZOOM_MIN, ZOOM_MAX} from "@lib/constants.js";
import {HeaderContainer, HeaderButton} from "../commons/header.jsx";

export const ZoomPanel = props => (
    <HeaderContainer>
        <HeaderButton
            icon="zoom-out"
            roundedEnd={false}
            disabled={props.zoom <= ZOOM_MIN}
            onClick={props.onZoomOutClick}
        />
        <div className="flex items-center justify-center w-12 h-full select-none">
            <span className="text-xs text-center">
                {(props.zoom * 100).toFixed(0)}%
            </span>
        </div>
        <HeaderButton
            icon="zoom-in"
            roundedStart={false}
            disabled={ZOOM_MAX <= props.zoom}
            onClick={props.onZoomInClick}
        />
    </HeaderContainer>
);

ZoomPanel.defaultProps = {
    zoom: 1,
    onZoomInClick: null,
    onZoomOutClick: null,
};
