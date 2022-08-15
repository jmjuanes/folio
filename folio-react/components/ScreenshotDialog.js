import React from "react";
import {elementsBase} from "@siimple/modules/elements.js";
import {css, elements} from "../styles.js";
import {Dialog} from "./Dialog.js";
import ICONS from "../icons.js";

const titleClass = css({
    ...elementsBase.title,
    fontSize: "2rem",
    fontFamily: "heading",
    userSelect: "none",
});

const buttonClass = css({
    ...elementsBase.button,
    alignItems: "center",
    backgroundColor: "white",
    color: "primary",
    display: "flex",
    justifyContent: "center",
    width: "100%",
    "&:hover": {
        backgroundColor: "primary",
        color: "white",
    },
    apply: "mixins.bordered",
});

const buttonIconClass = css({
    fontSize: "1.5rem",
    paddingRight: "0.5rem",
});

const dialogContentClass = css({
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
});

export const ScreenshotDialog = props => (
    <div className={elements.scrim}>
        <Dialog active style={{position:"relative"}}>
            <div className={titleClass} align="center">
                Screenshot
            </div>
            <div className={dialogContentClass}>
                <div className={buttonClass} onClick={props.onFullClick}>
                    <span className={buttonIconClass}>{ICONS.FULLSCREEN}</span>
                    <span>Full capture</span> 
                </div>
                <div className={buttonClass} onClick={props.onCropClick}>
                    <span className={buttonIconClass}>{ICONS.CROP}</span>
                    <span>Select region</span> 
                </div>
            </div>
        </Dialog>
    </div>
);
