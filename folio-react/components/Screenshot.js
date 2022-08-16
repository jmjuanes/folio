import React from "react";
import {Dialog} from "./Dialog.js";
import ICONS from "../icons.js";
import {
    css,
    outlineButtonClass,
    buttonIconClass,
    scrimClass,
    titleClass,
} from "../styles.js";

const dialogContentClass = css({
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
});

export const Screenshot = props => (
    <div className={scrimClass}>
        <Dialog active style={{position:"relative"}}>
            <div className={titleClass} align="center" style={{fontSize:"2rem"}}>
                Screenshot
            </div>
            <div className={dialogContentClass}>
                <div className={outlineButtonClass} onClick={props.onFullClick}>
                    <span className={buttonIconClass}>{ICONS.FULLSCREEN}</span>
                    <span>Full capture</span> 
                </div>
                <div className={outlineButtonClass} onClick={props.onRegionClick}>
                    <span className={buttonIconClass}>{ICONS.CROP}</span>
                    <span>Select region</span> 
                </div>
            </div>
        </Dialog>
    </div>
);
