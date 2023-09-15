import React from "react";
import {createRoot} from "react-dom/client";
import {loadFromJson, saveAsJson} from "./board/json.js";
import {Board} from "./components/Board.jsx";
import {useLocalStorage} from "./hooks/useLocalStorage.js";

import "lowcss/dist/low.css";

// Folio Lite component
const FolioLite = () => {
    const [state, setState] = useLocalStorage("folio-lite-data", {createdAt: Date.now()});

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-700">
            <Board
                key={state?.createdAt}
                initialData={() => {
                    return Promise.resolve(state);
                }}
                links={[
                    {url: "./", text: "About Folio"},
                    {url: process.env.URL_ISSUES, text: "Report a bug"},
                ]}
                showLoad={true}
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
