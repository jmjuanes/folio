import React from "react";
import {withBoard} from "../contexts/BoardContext.jsx";
import {HeaderContainer, HeaderButton} from "./HeaderCommons.jsx";

// History panel component
export const History = withBoard((props, board) => (
    <HeaderContainer>
        <HeaderButton
            icon="history-undo"
            disabled={board.isUndoDisabled()}
            onClick={props.onUndoClick}
        />
        <HeaderButton
            icon="history-redo"
            disabled={board.isRedoDisabled()}
            onClick={props.onRedoClick}
        />
    </HeaderContainer>
));

History.defaultProps = {
    onUndoClick: null,
    onRedoClick: null,
};
