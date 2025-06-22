import React from "react";
import {loadFromJson} from "folio-react/lib/json.js";
import {useConfirm} from "folio-react/contexts/confirm.jsx";
import {useClient} from "./client.jsx";
import {useHash} from "../hooks/use-hash.js";

// boards context, to store current boards and actions
const BoardsContext = React.createContext({});

// @description custom hook to access to boards context
export const useBoards = () => {
    return React.useContext(BoardsContext);
};

// @description boards provider
export const BoardsProvider = props => {
    const client = useClient();
    const [boards, setBoards] = React.useState([]);
    const [hash, redirect] = useHash();
    const {showConfirm} = useConfirm();
    const actions = React.useMemo(() => {
        const updateBoards = () => {
            return client.getUserBoards().then(data => {
                setBoards(data);
            });
        };
        const createBoard = (data = {}) => {
            return client.createBoard(data).then(response => {
                updateBoards();
                redirect(response.id);
            });
        };
        // return boards actions
        return {
            updateBoards: updateBoards,
            createBoard: createBoard,
            importBoard: () => {
                return loadFromJson().then(boardData => {
                    return createBoard({
                        data: boardData,
                    });
                });
            },
            deleteBoard: id => {
                return showConfirm({
                    title: "Delete board",
                    message: "Are you sure? This action can not be undone.",
                    callback: () => {
                        return client.deleteBoard(id).then(() => {
                            // TODO: display a confirmation message
                            // Check if the board that we are removing is the current visible board
                            // TODO: we would need to decide what to do. At this moment we just redirect to welcome
                            if (id === hash) {
                                redirect("");
                            }
                            // Update boards list in sidebar and welcome
                            updateBoards();
                        });
                    },
                });
            },
        };
    }, [client, setBoards, showConfirm, hash, redirect]);

    // on mount, update the boards
    React.useEffect(() => {
        actions.updateBoards();
    }, [client]);

    return (
        <BoardsContext.Provider value={[boards, actions]}>
            {props.children}
        </BoardsContext.Provider>
    );
};
