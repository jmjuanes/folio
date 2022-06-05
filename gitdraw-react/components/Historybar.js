import React from "react";
import kofi from "kofi";

const HistoryButton = props => (
    <div
        className={kofi.classNames({
            "has-p-2 has-radius-md has-lh-none": true,
            "has-bg-gray-200-hover is-clickable": !props.disabled,
            "has-text-gray-500": props.disabled,
        })}
        onClick={props.onClick}
    >
        <i className={`icon-${props.icon}`} />
    </div>
);

export const Historybar = props => (
    <div className="is-absolute has-pb-4 has-pl-4 has-bottom-none has-left-none">
        <div className="has-radius-md has-p-2 has-bg-gray-100 is-flex">
            <HistoryButton
                icon="undo"
                disabled={!!props.undoDisabled}
                onClick={props.onUndoClick}
            />
            <HistoryButton
                icon="redo"
                disabled={!!props.redoDisabled}
                onClick={props.onRedoClick}
            />
        </div>
    </div>
);