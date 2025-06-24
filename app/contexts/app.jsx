import React from "react";
import {loadFromJson} from "folio-react/lib/json.js";
import {useConfirm} from "folio-react/contexts/confirm.jsx";
import {useClient} from "./client.jsx";
import {useHash, getCurrentHash} from "../hooks/use-hash.js";

// main app context
const AppContext = React.createContext({});

// @description custom hook to access to app context
export const useApp = () => {
    return React.useContext(AppContext);
};

// @description app provider
export const AppProvider = props => {
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
                            const currentHash = getCurrentHash().replace(/^#/, "");
                            if (id === currentHash) {
                                redirect("");
                            }
                            // update boards list
                            updateBoards();
                        });
                    },
                });
            },
        };
    }, [client, setBoards, showConfirm, redirect]);

    // on mount, update the boards
    React.useEffect(() => {
        actions.updateBoards();
    }, [client]);

    return (
        <AppContext.Provider value={{boards, ...actions}}>
            {props.children}
        </AppContext.Provider>
    );
};
