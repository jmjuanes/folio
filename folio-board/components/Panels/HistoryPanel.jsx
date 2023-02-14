import React from "react";
import {Panel, PanelButton} from "./Panel.jsx";
import {UndoIcon, RedoIcon} from "../icons/index.jsx";

export const HistoryPanel = props => (
    <Panel className={props.className} style={props.style}>
        <PanelButton disabled={!!props.undoDisabled} onClick={props.onUndoClick}>
            <UndoIcon />
        </PanelButton>
        <PanelButton disabled={!!props.redoDisabled} onClick={props.onRedoClick}>
            <RedoIcon />
        </PanelButton>
    </Panel>
);

HistoryPanel.defaultProps = {
    className: "bottom:0 left:0 pb:4 pl:4",
    style: {},
    undoDisabled: true,
    redoDisabled: true,
    onUndoClick: null,
    onRedoClick: null,
};
