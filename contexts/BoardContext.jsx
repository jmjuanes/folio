import React from "react";
import {createBoard} from "../board/create.js";
import {useForceUpdate} from "../hooks/useForceUpdate.js";
import {Loading} from "../components/Loading.jsx";
import {useDelay} from "../hooks/index.js";

export const BoardContext = React.createContext({});

// Import initial board data
const loadBoardData = initialValue => {
    if (typeof initialValue === "function") {
        // Make sure to wrapp the call of this function inside a promise chain
        return Promise.resolve(null).then(() => {
            return initialValue();
        });
    }
    // Check if initial value is just an object
    else if (typeof initialValue === "object" && !!initialValue) {
        return Promise.resolve(initialValue);
    }
    // Other value is not supported
    return Promise.resolve({});
};

export const useBoard = () => {
    return React.useContext(BoardContext);
};

export const BoardProvider = props => {
    const forceUpdate = useForceUpdate();
    const board = React.useRef(null);
    // Import board data
    useDelay(props.delay, () => {
        // TODO: we need to catch error or check if returned data is valid
        loadBoardData(props.initialData).then(boardData => {
            board.current = createBoard({
                data: boardData,
                onUpdate: forceUpdate,
            });
            forceUpdate();
        });
    });
    // If no board data has been provided, display a loading screen
    if (!board.current) {
        return (
            <Loading />
        );
    }
    return (
        <BoardContext.Provider value={board.current}>
            {props.render()}
        </BoardContext.Provider>
    );
};

BoardProvider.defaultProps = {
    initialData: null,
    delay: 1000,
    render: null,
};
