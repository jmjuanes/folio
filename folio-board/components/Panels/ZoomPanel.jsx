import React from "react";
import {ZOOM_MIN, ZOOM_MAX} from "folio-core";
import {Panel, PanelButton} from "./Panel.jsx";
import {ZoomInIcon, ZoomOutIcon} from "../icons/index.jsx";

export const ZoomPanel = props => (
    <Panel className={props.className} style={props.style}>
        <PanelButton disabled={props.zoom <= ZOOM_MIN} onClick={props.onZoomOutClick}>
            <ZoomOutIcon />
        </PanelButton>
        <div className="text-xs o-80 text-center w-16 select-none">
            {(props.zoom * 100).toFixed(0)}%
        </div>
        <PanelButton disabled={ZOOM_MAX <= props.zoom} onClick={props.onZoomInClick}>
            <ZoomInIcon />
        </PanelButton>
    </Panel>
);

ZoomPanel.defaultProps = {
    className: "bottom-0 right-0 pb-4 pr-4",
    style: {},
    zoom: 1,
    onZoomInClick: null,
    onZoomOutClick: null,
};
