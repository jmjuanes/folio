import React from "react";
import kofi from "kofi";

import ICONS from "../icons.js";

const HistoryButton = props => (
    <div
        className={kofi.classNames({
            "has-p-2 has-radius-md has-lh-none": true,
            "has-text-primary-hover is-clickable": !props.disabled,
            "has-opacity-25": props.disabled,
        })}
        onClick={props.onClick}
    >
        {props.icon}
    </div>
);

export const Historybar = props => (
    <div className="is-absolute has-pb-4 has-pl-4 has-bottom-none has-left-none">
        <div className="has-radius-md has-p-2 has-bg-white is-bordered is-flex">
            <HistoryButton
                icon={ICONS.UNDO}
                disabled={!!props.undoDisabled}
                onClick={props.onUndoClick}
            />
            <HistoryButton
                icon={ICONS.REDO}
                disabled={!!props.redoDisabled}
                onClick={props.onRedoClick}
            />
        </div>
    </div>
);
