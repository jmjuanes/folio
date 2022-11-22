import React from "react";

import {Panel, PanelButton} from "./Panel.jsx";
import {UndoIcon, RedoIcon} from "../icons/index.jsx";

export const HistoryPanel = props => (
    <Panel position="bottom-left">
        <PanelButton disabled={!!props.undoDisabled} onClick={props.onUndoClick}>
            <UndoIcon />
        </PanelButton>
        <PanelButton disabled={!!props.redoDisabled} onClick={props.onRedoClick}>
            <RedoIcon />
        </PanelButton>
    </Panel>
);

HistoryPanel.defaultProps = {
    undoDisabled: true,
    redoDisabled: true,
    onUndoClick: null,
    onRedoClick: null,
};
