import React from "react";

import {Button} from "./Button.js";
import ICONS from "../icons.js";
import {css} from "../styles.js";

const zoomWrapperClass = css({
    apply: "mixins.animations.bottom",
    bottom: "0px",
    right: "0px",
    paddingBottom: "1rem",
    paddingRight: "1rem",
    position: "absolute",
    zIndex: "100",
});

const zoomClass = css({
    apply: "mixins.dialog",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "0.5rem",
    display: "flex",
    padding: "0.5rem",
    userSelect: "none",
});

const zoomValueClass = css({
    fontSize: "0.875rem",
    fontWeight: "bold",
    opacity: 0.8,
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    textAlign: "center",
    width: "3.5rem",
    userSelect: "none",
});

export const Zoom = props => (
    <div className={zoomWrapperClass}>
        <div className={zoomClass}>
            <Button
                icon={ICONS.ZOOM_OUT}
                disabled={!!props.zoomOutDisabled}
                onClick={props.onZoomOutClick}
            />
            <div className={zoomValueClass}>
                {(props.zoom * 100).toFixed(0)}%
            </div>
            <Button
                icon={ICONS.ZOOM_IN}
                disabled={!!props.zoomInDisabled}
                onClick={props.onZoomInClick}
            />
        </div>
    </div>
);
