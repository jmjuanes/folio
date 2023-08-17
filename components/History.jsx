import React from "react";

import {useBoard} from "../contexts/BoardContext.jsx";
import {SecondaryButton} from "./Button.jsx";
import {UndoIcon, RedoIcon} from "./Icons.jsx";

// History panel component
export const History = props => {
    const board = useBoard();
    return (
        <div className="flex gap-0 items-center">
            <SecondaryButton
                icon={(<UndoIcon />)}
                disabled={board.isUndoDisabled()}
                style={{
                    borderTopRightRadius: "0px",
                    borderBottomRightRadius: "0px",
                }}
                onClick={props.onUndoClick}
            />
            <SecondaryButton
                icon={(<RedoIcon />)}
                disabled={board.isRedoDisabled()}
                style={{
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px",
                }}
                onClick={props.onRedoClick}
            />
        </div>
    );
};

History.defaultProps = {
    onUndoClick: null,
    onRedoClick: null,
};
