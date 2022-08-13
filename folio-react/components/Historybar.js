import React from "react";

import {Button} from "./Button.js";
import ICONS from "../icons.js";
import {css} from "../styles.js";

const historyWrapperClass = css({
    apply: "mixins.animations.bottom",
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
        </div>
    </div>
);
