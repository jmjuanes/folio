import React from "react";
import {ZOOM_MIN, ZOOM_MAX} from "../../constants.js";
import {Island} from "../island.jsx";

export const ZoomPanel = props => (
    <Island>
        <Island.Button
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
        <Island.Button
            icon="zoom-in"
            roundedStart={false}
            disabled={ZOOM_MAX <= props.zoom}
            onClick={props.onZoomInClick}
        />
    </Island>
);

ZoomPanel.defaultProps = {
    zoom: 1,
    onZoomInClick: null,
    onZoomOutClick: null,
};
