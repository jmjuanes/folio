import React from "react";
import {saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {useRouter} from "../contexts/RouterContext.jsx";
import {Board} from "./Board.jsx";
import {useDebounce} from "../hooks/index.js";

// Board wrapper
const BoardWrapper = props => {
    const client = useClient();
    const state = React.useRef({});
    // Use a debounce function to handle state changes
    const saveBoard = useDebounce(250, () => {
        client.updateBoard(props.id, state.current).then(() => {
            // TODO: show board updated message
        });
    });
    return (
        <Board
            key={props.id}
            initialData={() => client.getBoard(props.id)}
            links={[
                {url: process.env.URL_REPOSITORY, text: "About Folio"},
                {url: process.env.URL_ISSUES, text: "Report a bug"},
            ]}
            showLoad={false}
            onChange={newState => {
                state.current = {
                    ...state.current,
                    ...newState,
                    updatedAt: Date.now(),
                };
                saveBoard();
            }}
            onSave={() => {
                client.getBoard(props.id).then(data => {
                    return saveAsJson(data);
                });
            }}
        />
    );
};

export const App = () => {
    // const client = useClient();
    const {currentPath, redirect} = useRouter();
    // Check if we are in a board
    if (currentPath.startsWith("#board/")) {
        const boardId = currentPath.replace("#board/", "").trim();
        return (
            <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-700">
                <BoardWrapper id={boardId} />
            </div>
        );
    }
    // Other case, render welcome page
    return (
        <div>
            Hello world
        </div>
    );
};
