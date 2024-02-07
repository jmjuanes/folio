import React from "react";
import {HeaderContainer, HeaderButton} from "@components/commons/header.jsx";

// History panel component
export const HistoryPanel = props => (
    <HeaderContainer>
        <HeaderButton
            icon="history-undo"
            roundedEnd={false}
            disabled={props.undoDisabled}
            onClick={props.onUndoClick}
        />
        <HeaderButton
            icon="history-redo"
            roundedStart={false}
            disabled={props.redoDisabled}
            onClick={props.onRedoClick}
        />
    </HeaderContainer>
);

HistoryPanel.defaultProps = {
    undoDisabled: false,
    redoDisabled: false,
    onUndoClick: null,
    onRedoClick: null,
};
