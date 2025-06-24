import React from "react";
import {loadFromJson} from "folio-react/lib/json.js";
import {useConfirm} from "folio-react/contexts/confirm.jsx";
import {useDialog} from "folio-react/contexts/dialogs.jsx";
import {useClient} from "../contexts/client.jsx";
import {useRouter, Route, Switch} from "../contexts/router.jsx";
import {Sidebar} from "./sidebar.jsx";
import {Welcome} from "./welcome.jsx";
import {Board} from "./board.jsx";
import {BoardRenameDialog} from "./dialogs/board-rename.jsx";

export const App = () => {
    const client = useClient();
    const [boards, setBoards] = React.useState([]);
    const [hash, redirect] = useRouter();
    const {showConfirm} = useConfirm();
    const {showDialog} = useDialog();
    
    // after any change, force to update boards list by calling the /boards endpoint
    const updateBoards = React.useCallback(() => {
        client.getUserBoards().then(data => {
            return setBoards(data);
        });
    }, [client, setBoards]);

    // when a board is created, we redirect to the board id and force to
    // update the boards list displayed in the sidebar
    const handleBoardCreate = React.useCallback((data = {}) => {
        return client.createBoard(data).then(response => {
            updateBoards();
            redirect(response.id);
        });
    }, [client, updateBoards, redirect]);

    // importing a new board just loads it from a local file and
    // calls handleBoardCreate to save it in the server
    const handleBoardImport = React.useCallback(() => {
        return loadFromJson().then(boardData => {
            return handleBoardCreate({
                data: boardData,
            });
        });
    }, [handleBoardCreate]);

    // to rename a board we display a dialog containing the 
    // BoardRenameDialog component
    const handleBoardRename = React.useCallback(id => {
        return showDialog({
            component: BoardRenameDialog,
            dialogClassName: "w-full max-w-sm",
            props: {
                id: id,
                onSubmit: updateBoards, // update the boards list after renaming
            },
        });
    }, [showDialog, updateBoards]);

    // to delete a board we just display a confirmation component
    const handleBoardDelete = React.useCallback(id => {
        return showConfirm({
            title: "Delete board",
            message: "Are you sure? This action can not be undone.",
            callback: () => {
                return client.deleteBoard(id).then(() => {
                    // TODO: display a confirmation message?
                    if (id === hash) {
                        redirect("");
                    }
                    // update boards list
                    updateBoards();
                });
            },
        });
    }, [client, updateBoards, hash, redirect]);

    // on mount, update the boards to be displayed in the sidebar
    // and in the welcome screen
    React.useEffect(() => updateBoards(), [client]);

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-gray-800 flex">
            <Sidebar
                boards={boards}
                defaultCollapsed={false}
                onBoardCreate={handleBoardCreate}
                onBoardImport={handleBoardImport}
                onBoardRename={handleBoardRename}
                onBoardDelete={handleBoardDelete}
            />
            <Switch>
                <Route test={/^$/} render={() => (
                    <Welcome boards={boards} />
                )} />
                <Route test={/^\w+$/} render={() => (
                    <Board key={hash} id={hash} />
                )} />
            </Switch>
        </div>
    );
};
