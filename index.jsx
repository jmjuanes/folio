import React from "react";
import {createRoot} from "react-dom/client";
import {VERSION} from "@lib/constants.js";
import {loadFromJson, saveAsJson} from "@lib/json.js";
import {migrate} from "@lib/migrate.js";
import {useLocalStorage} from "@lib/hooks/use-storage.js";
import {renameItem} from "@lib/utils/storage.js";
import {Board} from "@components/board.jsx";

const STORE_KEY = "folio:data";

const App = () => {
    const [state, setState] = useLocalStorage(STORE_KEY, {
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
                key={(state?.version || "") + "." + (state?.createdAt || "")}
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

// Temporal migration from 'folio-lite' storage key to 'folio:data'
// This should removed in future releases
renameItem("folio-lite", STORE_KEY);

createRoot(document.getElementById("root")).render((
    <App version={process.env.VERSION} />
));
