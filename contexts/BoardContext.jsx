import React from "react";
import {createBoard} from "../board.js";
import {useForceUpdate} from "../hooks/useForceUpdate.js";

export const BoardContext = React.createContext({});

export const useBoard = () => {
    return React.useContext(BoardContext)?.current;
};

export const BoardProvider = props => {
    const forceUpdate = useForceUpdate();
    const board = React.useRef(null);

    if (!board.current) {
        board.current = createBoard({
            data: props.initialData || {},
            onUpdate: forceUpdate,
        });
    }

    return (
        <BoardContext.Provider value={board}>
            {props.render()}
        </BoardContext.Provider>
    );
};

BoardProvider.defaultProps = {
    initialData: {},
    render: null,
};
