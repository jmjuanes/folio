import React from "react";
import {Island} from "../island.jsx";

// History panel component
export const HistoryPanel = props => (
    <Island>
        <Island.Button
            icon="history-undo"
            roundedEnd={false}
            disabled={props.undoDisabled}
            onClick={props.onUndoClick}
        />
        <Island.Button
            icon="history-redo"
            roundedStart={false}
            disabled={props.redoDisabled}
            onClick={props.onRedoClick}
        />
    </Island>
);

HistoryPanel.defaultProps = {
    undoDisabled: false,
    redoDisabled: false,
    onUndoClick: null,
    onRedoClick: null,
};
