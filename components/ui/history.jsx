import React from "react";
import {withBoard} from "@components/contexts/board.jsx";
import {HeaderContainer, HeaderButton} from "@components/commons/header.jsx";

// History panel component
export const History = withBoard((props, board) => (
    <HeaderContainer>
        <HeaderButton
            icon="history-undo"
            roundedEnd={false}
            disabled={board.isUndoDisabled()}
            onClick={props.onUndoClick}
        />
        <HeaderButton
            icon="history-redo"
            roundedStart={false}
            disabled={board.isRedoDisabled()}
            onClick={props.onRedoClick}
        />
    </HeaderContainer>
));

History.defaultProps = {
    onUndoClick: null,
    onRedoClick: null,
};
