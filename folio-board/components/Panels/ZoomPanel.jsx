import React from "react";
import cn from "classnames";
import {ZOOM_MIN, ZOOM_MAX} from "../../constants.js";
import {Panel, PanelButton} from "./Panel.jsx";
import {ZoomInIcon, ZoomOutIcon} from "../icons/index.jsx";

export const ZoomPanel = props => (
    <Panel className={cn("bottom:0 right:0 pb:4 pr:4", props.className)}>
        <PanelButton disabled={props.zoom <= ZOOM_MIN} onClick={props.onZoomOutClick}>
            <ZoomOutIcon />
        </PanelButton>
        <div className="text:xs o:80 text:center w:16 select:none">
            {(props.zoom * 100).toFixed(0)}%
        </div>
        <PanelButton disabled={ZOOM_MAX <= props.zoom} onClick={props.onZoomInClick}>
            <ZoomInIcon />
        </PanelButton>
    </Panel>
);

ZoomPanel.defaultProps = {
    className: "",
    zoom: 1,
    onZoomInClick: null,
    onZoomOutClick: null,
};
