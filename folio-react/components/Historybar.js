import React from "react";
import {classNames} from "@siimple/styled";
import ICONS from "../icons.js";
import {css} from "../styles.js";

const historyButtonClass = css({
    borderRadius: "0.5rem",
    fontSize: "1.25rem",
    lineHeight: "1",
    padding: "0.5rem",
    "&.is-not-disabled:hover": {
        backgroundColor: "primary",
        color: "#fff",
        cursor: "pointer",
    },
    "&.is-disabled": {
        opacity: "0.25",
    },
});

const historyWrapperClass = css({
    bottom: "0px",
    left: "0px",
    paddingBottom: "1rem",
    paddingLeft: "1rem",
    position: "absolute",
    zIndex: "100",
});

const historyClass = css({
    apply: "mixins.dialog",
    backgroundColor: "#fff",
    borderRadius: "0.5rem",
    display: "flex",
    padding: "0.5rem",
});

const Button = props => (
    <div
        className={classNames({
            [historyButtonClass]: true,
            "is-not-disabled": !props.disabled,
            "is-disabled": props.disabled,
        })}
        onClick={props.onClick}
    >
        {props.icon}
    </div>
);

export const Historybar = props => (
    <div className={historyWrapperClass}>
        <div className={historyClass}>
            <Button
                icon={ICONS.UNDO}
                disabled={!!props.undoDisabled}
                onClick={props.onUndoClick}
            />
            <Button
                icon={ICONS.REDO}
                disabled={!!props.redoDisabled}
                onClick={props.onRedoClick}
            />
            <Button
                icon={ICONS.ZOOM_OUT}
                disabled={!!props.zoomOutDisabled}
                onClick={props.onZoomOutClick}
            />
            <Button
                icon={ICONS.ZOOM_IN}
                disabled={!!props.zoomInDisabled}
                onClick={props.onZoomInClick}
            />
        </div>
    </div>
);
