import React from "react";
import {createRoot} from "react-dom/client";
import {useDebounce, useHash, useToggle} from "react-use";
import {SidebarLeftOpenIcon, SidebarLeftCloseIcon} from "@josemi-icons/react";
import {VERSION} from "@lib/constants.js";
import {loadFromJson, saveAsJson} from "@lib/json.js";
import {migrate} from "@lib/migrate.js";
import {Board} from "@components/board.jsx";
import Welcome from "@components/welcome.jsx";
import Sidebar from "@components/sidebar.jsx";
import {ClientProvider, useClient} from "@components/contexts/client.jsx";
import {ConfirmProvider, useConfirm} from "@components/contexts/confirm.jsx";

const App = props => {
    const client = useClient();
    const [hash, redirect] = useHash();
    const {showConfirm} = useConfirm();
    const [state, setState] = React.useState({});
    const [sidebarVisible, toggleSidebarVisible] = useToggle(true);
    const id = hash.replace(/^#/, "");

    // Handle board creation
    // After creating the new board, we automatically open it using redirect method
    const handleBoardCreate = React.useCallback(() => {
        client.add({}).then(boardId => redirect(boardId));
    }, []);

    // Hande board delete
    const handleBoardDelete = React.useCallback(boardId => {
        return showConfirm({
            title: "Delete board",
            message: "Are you sure? This action can not be undone.",
            callback: () => {
                client.delete(boardId)
                    .then(() => {
                        // TODO: display a confirmation message
                        // Check if the board that we are removing is the current visible board
                        // TODO: we would need to decide what to do. At this moment we just redirect to welcome
                        if (boardId === id) {
                            redirect("");
                        }
                    })
                    .catch(error => console.error(error));
            },
        });
    }, [id]);

    // Handle board import => import board data from JSON and save into the DB
    // Then, redirect to the new url
    const handleBoardImport = React.useCallback(() => {
        return loadFromJson()
            .then(data => client.add({
                ...data,
                createdAt: Date.now(),
            }))
            .then(boardId => redirect(boardId))
            .catch(error => {
                console.error(error);
            });
    });

    // Terrible hack to force updating saved state after each id change
    React.useEffect(() => setState({id: id}), [id]);
    
    // Hook to save changes into storage
    useDebounce(() => {
        if (!!id && state?.updatedAt) {
            client.update(id, state).then(() => {
                // TODO: show confirmation message
            });
        }
    }, 250, [state?.updatedAt]);

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-neutral-800 flex">
            {sidebarVisible && (
                <Sidebar
                    key={"sidebar:" + id}
                    currentId={id}
                    loadBoards={() => client.list()}
                    onBoardCreate={handleBoardCreate}
                    onBoardImport={handleBoardImport}
                    onBoardDelete={handleBoardDelete}
                />
            )}
            {!id && (
                <Welcome
                    loadBoards={() => client.list()}
                    onBoardCreate={handleBoardCreate}
                    onBoardImport={handleBoardImport}
                />
            )}
            {(!!id && state?.id === id) && (
                <Board
                    key={id}
                    initialData={() => {
                        return client.get(id);
                    }}
                    links={[
                        {url: "./", text: "About Folio"},
                        {url: process.env.URL_ISSUES, text: "Report a bug"},
                    ]}
                    headerLeftContent={(
                        <div
                            className="cursor-pointer order-first flex items-center rounded-lg py-1 px-2 hover:bg-neutral-100 group"
                            onClick={() => toggleSidebarVisible()}
                        >
                             <div className="flex items-center text-2xl text-neutral-700 group-hover:text-neutral-900">
                                {sidebarVisible ? <SidebarLeftCloseIcon /> : <SidebarLeftOpenIcon />}
                            </div>
                        </div>
                    )}
                    showLoad={false}
                    showWelcomeHint={true}
                    onChange={newState => {
                        return setState(prevState => ({
                            ...prevState,
                            ...newState,
                            updatedAt: Date.now(),
                        }));
                    }}
                    onSave={() => {
                        saveAsJson(state)
                            .then(() => console.log("Folio file saved"))
                            .catch(error => console.error(error));
                    }}
                />
            )}
        </div>
    );
};

createRoot(document.getElementById("root")).render((
    <ClientProvider>
        <ConfirmProvider>
            <App />
        </ConfirmProvider>
    </ClientProvider>
));
