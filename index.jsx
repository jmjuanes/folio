import React from "react";
import {createRoot} from "react-dom/client";
import {useDebounce, useHash, useToggle} from "react-use";
import {ChevronLeftIcon, ChevronRightIcon} from "@josemi-icons/react";
import {saveAsJson, loadFromJson} from "@lib/json.js";
import {ClientProvider, useClient} from "@components/contexts/client.jsx";
import {ConfirmProvider, useConfirm} from "@components/contexts/confirm.jsx";
import {Board} from "@components/board.jsx";
import {Welcome} from "@components/welcome.jsx";
import {Sidebar} from "@components/sidebar.jsx";

const App = () => {
    const client = useClient();
    const [hash, redirect] = useHash();
    const {showConfirm} = useConfirm();
    const [state, setState] = React.useState({});
    const [boards, setBoards] = React.useState([]);
    const [sidebarVisible, toggleSidebarVisible] = useToggle(false);
    const hasChangedTitle = React.useRef(false);
    const hasBeenInitialized = React.useRef(false);
    const id = (hash || "").replace(/^#/, ""); // Remove leading hash

    // Update boards list
    // This method must be called after each update in the boards
    const updateBoards = React.useCallback(() => {
        return client.list()
            .then(data => data.sort((a, b) => a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1))
            .then(data => {
                // Display the sidebar on init when there are boards
                if (!hasBeenInitialized.current && data.length > 0) {
                    toggleSidebarVisible(true);
                }
                // Save boards
                setBoards(data);
            });
    }, []);

    // Handle board create.
    const handleBoardCreate = React.useCallback(() => {
        return client.add({})
            .then(newBoardId => redirect(newBoardId))
            .then(() => updateBoards());
    }, []);

    // Handle board import
    const handleBoardImport = React.useCallback(() => {
        return loadFromJson()
            .then(data => client.add(data || {}))
            .then(boardId => redirect(boardId))
            .then(() => updateBoards())
            .catch(error => {
                console.error(error);
            });
    }, []);
    
    // Handle board delete
    // First it will display a confirmation dialog
    const handleBoardDelete = React.useCallback(boardId => {
        return showConfirm({
            title: "Delete board",
            message: "Are you sure? This action can not be undone.",
            callback: () => {
                return client.delete(boardId)
                    .then(() => {
                        // TODO: display a confirmation message
                        // Check if the board that we are removing is the current visible board
                        // TODO: we would need to decide what to do. At this moment we just redirect to welcome
                        if (boardId === id) {
                            redirect("");
                        }
                        // Update boards list in sidebar and welcome
                        updateBoards();
                    })
                    .catch(error => console.error(error));
            },
        });
    }, [id]);

    // Hook to update current state abd boards list
    React.useEffect(() => {
        // Terrible hack to force updating saved state after each id change
        // This will ensure that data of previous board is not saved on the current board
        setState({id: id});

        if (!hasBeenInitialized.current || id === "") {
            updateBoards().then(() => {
                hasBeenInitialized.current = true;
            });
        }
    }, [id]);

    // Hook to save changes into storage
    useDebounce(() => {
        if (!!id && state?.updatedAt) {
            client.update(id, state).then(() => {
                // Check if sidebar is visible for updating the boards list
                if (sidebarVisible && hasChangedTitle.current) {
                    updateBoards();
                }
                // TODO: show confirmation message
                hasChangedTitle.current = false;
            });
        }
    }, 250, [state?.updatedAt]);

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-neutral-800 flex">
            {sidebarVisible && (
                <Sidebar
                    currentId={id}
                    boards={boards}
                    onBoardCreate={handleBoardCreate}
                    onBoardDelete={handleBoardDelete}
                    onBoardImport={handleBoardImport}
                />
            )}
            <div className="relative h-full">
                <div
                    className="absolute left-0 top-half z-5 cursor-pointer"
                    style={{
                        transform: "translateY(-50%)",
                    }}
                    onClick={() => toggleSidebarVisible()}
                >
                    <div className="flex bg-neutral-200 text-lg py-2 pr-1 rounded-tr-md rounded-br-md">
                        {sidebarVisible ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </div>
                </div>
            </div>
            {!id && (
                <Welcome
                    boards={[...boards]}
                    onBoardCreate={handleBoardCreate}
                    onBoardImport={handleBoardImport}
                />
            )}
            {(!!id && state?.id === id) && (
                <Board
                    key={id}
                    initialData={() => client.get(id)}
                    links={[
                        {url: "./", text: "About Folio"},
                        {url: process.env.URL_ISSUES, text: "Report a bug"},
                    ]}
                    showLoad={true}
                    showWelcomeHint={true}
                    onChange={newState => {
                        // Check if we have changed the title
                        // This will force an update in the sidebar
                        if (typeof newState.title === "string") {
                            hasChangedTitle.current = true;
                        }
                        return setState(prevState => ({
                            ...prevState,
                            ...newState,
                            updatedAt: Date.now(),
                        }));
                    }}
                    onLoad={() => handleBoardImport()}
                    onSave={() => {
                        return client.get(id)
                            .then(data => saveAsJson(data))
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
