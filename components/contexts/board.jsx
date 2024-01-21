import React from "react";
import {createBoard} from "@lib/board.js";
import {useDelay, useForceUpdate} from "@lib/hooks/index.js";
import {Loading} from "@components/loading.jsx";

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

export const withBoard = fn => {
    return props => {
        return fn(props, useBoard());
    };
};

export const BoardProvider = props => {
    const forceUpdate = useForceUpdate()[1];
    const board = React.useRef(null);
    // Import board data
    useDelay(props.delay, () => {
        loadBoardData(props.initialData)
            .then(boardData => {
                board.current = createBoard({
                    data: boardData,
                    onUpdate: forceUpdate,
                });
                forceUpdate();
            })
            .catch(error => {
                props?.onError?.(error);
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
    onError: null,
};
