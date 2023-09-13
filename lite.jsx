import React from "react";
import {createRoot} from "react-dom/client";
import {ConfirmProvider} from "./contexts/ConfirmContext.jsx";
import {saveAsJson} from "./board/json.js";
import {Board} from "./components/Board.jsx";
import {useDebounce} from "./hooks/index.js";

// Folio Lite component
const FolioLite = () => {
    const [state, setState] = React.useState({});
    const [error, setError] = React.useState(false);
    const id = currentPath.replace("#board/", "").trim();
    // Use a debounce function to handle state changes
    useDebounce(250, [state?.updatedAt], () => {
        if (state?.updatedAt) {
            client.updateBoard(id, state).then(() => {
                // TODO: show board updated message
            });
        }
    });
    return (
        <Board
            key={id}
            initialData={() => client.getBoard(id)}
            links={[
                {url: process.env.URL_REPOSITORY, text: "About Folio"},
                {url: process.env.URL_ISSUES, text: "Report a bug"},
            ]}
            headerLeftContent={(
                <a href="#" className="no-underline order-first flex items-center gap-2 bg-gray-900 rounded-lg py-1 px-3 shadow-md">
                    <div className="hidden items-center text-2xl text-white">
                        <DrawingIcon />
                    </div>
                    <div className="flex items-center select-none font-crimson text-3xl leading-none">
                        <span className="font-black leading-none text-white">Folio.</span>
                    </div>
                </a>
            )}
            showLoad={false}
            onChange={newState => {
                return setState(prevState => ({
                    ...prevState,
                    ...newState,
                    updatedAt: Date.now(),
                }));
            }}
            onSave={() => {
                client.getBoard(id)
                    .then(data => saveAsJson(data))
                    .catch(error => console.error(error));
            }}
            onError={() => setError(true)}
        />
    );
};


// Mount Folio Lite
createRoot(document.getElementById("root")).render((
    <ConfirmProvider>
        <FolioLite />
    </ConfirmProvider>
));
