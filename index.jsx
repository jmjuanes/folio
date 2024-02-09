import React from "react";
import {createRoot} from "react-dom/client";
import {useDebounce, useHash, useToggle} from "react-use";
import {saveAsJson, loadFromJson} from "@lib/json.js";
import {ClientProvider, useClient} from "@contexts/client.jsx";
import {ConfirmProvider, useConfirm} from "@contexts/confirm.jsx";
import {Editor} from "@components/editor.jsx";

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
        // Import data for the current opened board
        if (id && state?.id !== id) {
            client.get(id).then(data => {
                setState({id: id, ...data});
            })
        }
        // Check for importing boards data
        if (!hasBeenInitialized.current || !id) {
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
            {(!!id && state?.id === id) && (
                <Editor
                    key={id}
                    initialData={state}
                    links={[
                        {url: "./", text: "About Folio"},
                        {url: process.env.URL_ISSUES, text: "Report a bug"},
                    ]}
                    showLoad={true}
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
