import React from "react";
import ICONS from "../icons.js";
import {classNames} from "../utils/classNames.js";

const HistoryButton = props => (
    <div
        className={classNames([
            "has-p-2 has-radius-md has-lh-none",
            !props.disabled && "has-text-white-hover has-bg-body-hover is-clickable",
            props.disabled && "has-opacity-25",
        ])}
        onClick={props.onClick}
    >
        {props.icon}
    </div>
);

export const Historybar = props => (
    <div
        className="is-absolute has-pb-4 has-pl-4 has-bottom-none has-left-none"
        style={{zIndex:100}}
    >
        <div className="has-radius-md has-p-2 has-bg-white is-bordered is-flex has-shadow-md">
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
