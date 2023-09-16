import React from "react";
import {createRoot} from "react-dom/client";
import {VERSION} from "./constants.js";
import {loadFromJson, saveAsJson} from "./board/json.js";
import {migrate} from "./board/migrate.js";
import {Board} from "./components/Board.jsx";
import {useLocalStorage} from "./hooks/useLocalStorage.js";

import "lowcss/dist/low.css";

// Folio Lite component
const FolioLite = () => {
    const [state, setState] = useLocalStorage("folio-lite", {
        version: VERSION,
        createdAt: Date.now(),
    });
    // Hook to migrate data after initialization
    React.useEffect(() => {
        if (state.version && state.version !== VERSION) {
            setState(migrate(state, state.version));
        }
    }, [state.version]);
    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-700">
            <Board
                key={(state.version || "") + "." + (state?.createdAt || "")}
                initialData={() => {
                    return Promise.resolve(state);
                }}
                links={[
                    {url: "./", text: "About Folio"},
                    {url: process.env.URL_ISSUES, text: "Report a bug"},
                ]}
                showLoad={true}
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
                onLoad={() => {
                    loadFromJson()
                        .then(data => {
                            setState({
                                ...data,
                                createdAt: Date.now(),
                            });
                        })
                        .catch(error => console.error(error));
                }}
            />
        </div>
    );
};

// Mount Folio Lite
createRoot(document.getElementById("root"))
    .render(<FolioLite />);
