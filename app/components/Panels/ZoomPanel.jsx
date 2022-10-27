import React from "react";

import {ZOOM_MIN, ZOOM_MAX} from "../../constants.js";
import {Panel, PanelButton} from "./index.jsx";
import {ZoomInIcon, ZoomOutIcon} from "../Icons.jsx";

export const ZoomPanel = props => (
    <Panel position="bottom-right">
        <PanelButton disabled={props.zoom <= ZOOM_MIN} onClick={props.onZoomOutClick}>
            <ZoomOutIcon />
        </PanelButton>
        <div className="text-sm font-bold o-80 text-center w-16 select-none">
            {(props.zoom * 100).toFixed(0)}%
        </div>
        <PanelButton disabled={ZOOM_MAX <= props.zoom} onClick={props.onZoomInClick}>
            <ZoomInIcon />
        </PanelButton>
    </Panel>
);

ZoomPanel.defaultProps = {
    zoom: 1,
    onZoomInClick: null,
    onZoomOutClick: null,
};
