import React from "react";
import {useUpdate, useMount} from "react-use";
import {LoaderIcon} from "@josemi-icons/react";
import {Centered} from "@josemi-ui/react";
import {createBoard} from "@lib/board.js";

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
    const update = useUpdate();
    const board = React.useRef(null);

    useMount(() => {
        loadBoardData(props.initialData)
            .then(boardData => {
                board.current = createBoard({
                    data: boardData,
                    onUpdate: update,
                });
                update();
            })
            .catch(error => {
                props?.onError?.(error);
            });
    });

    // If no board data has been provided, display a loading screen
    if (!board.current) {
        return (
            <Centered className="h-full">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center text-2xl animation-spin">
                        <LoaderIcon />
                    </div>
                    <div className="text-2xs text-neutral-400">
                        <span>Loading board</span>
                    </div>
                </div>
            </Centered>
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
    render: null,
    onError: null,
};
