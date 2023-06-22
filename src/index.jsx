import React from "react";
import {createRoot} from "react-dom/client";
import * as idb from "idb-keyval";

import {VERSION} from "./constants.js";
import {migrate} from "./migrate.js";
import {loadFromJson, saveAsJson} from "./json.js";
import {Board} from "./presets/Board.jsx";
import {Welcome} from "./components/Welcome.jsx";

// TODO: we need to remove this import and add a new styles.css file
import "lowcss/dist/low.css";

// Store keys for IDB
const STORE_KEYS = {
    VERSION: "version",
    DATA: "data",
    STATE: "state",
    SETTINGS: "settings",
};

// Global store
const store = idb.createStore("folio", "folio-store");

// Tiny utility to initialize the app store
const initializeStore = async () => {
    const keys = await idb.keys(store);
    
    // Check for empty keys store
    if (keys.length === 0) {
        await idb.set(STORE_KEYS.VERSION, VERSION, store);
        await idb.set(STORE_KEYS.DATA, {}, store);
    }
    else {
        // Check if we need to migrate STATE to DATA
        if (keys.includes(STORE_KEYS.STATE) && !keys.includes(STORE_KEYS.DATA)) {
            const data = await idb.get(STORE_KEYS.STATE, store);
            await idb.set(STORE_KEYS.DATA, data, store);
            await idb.del(STORE_KEYS.STATE, store);
        }
        // Check if we need to perform an upgrade to the new version of folio
        const currentVersion = await idb.get(STORE_KEYS.VERSION, store);
        if (currentVersion !== VERSION) {
            const prevData = await idb.get(STORE_KEYS.DATA, store);
            const newData = {
                ...prevData,
                ...migrate(prevData, currentVersion),
            };
            await idb.set(STORE_KEYS.DATA, newData, store);
            await idb.set(STORE_KEYS.VERSION, VERSION, store);
        }
    }
    // Store initialized
    return true;
};

const App = props => {
    const [state, setState] = React.useState({});
    const [welcomeVisible, setWelcomeVisible] = React.useState(true);

    // Debounce the data saving to store
    React.useEffect(() => {
        const callback = () => {
            state.createdAt && idb.set(STORE_KEYS.DATA, state, store);
        };
        const handler = setTimeout(() => callback(), 250);

        return () => clearTimeout(handler);
    }, [state]);

    // Initialize board store
    React.useEffect(() => {
        initializeStore()
            .then(() => idb.get(STORE_KEYS.DATA, store))
            .then(prevData => {
                setState({createdAt: Date.now(), ...prevData});
                setWelcomeVisible(!(prevData?.elements?.length > 0));
            });
    }, []);

    // Handle file save
    const handleFileSave = () => {
        return saveAsJson({
            elements: state.elements || [],
            assets: state.assets || {},
            grid: !!state.grid,
            background: state.background || null,
        });
    };

    // Handle file load
    const handleFileLoad = () => {
        loadFromJson()
            .then(data => {
                setState({
                    ...data,
                    createdAt: Date.now(),
                });
                setWelcomeVisible(false);
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-white text-base text-gray-700">
            <Board
                key={state.createdAt ?? ""}
                initialData={state}
                links={[
                    {url: process.env.URL_REPOSITORY, text: "About Folio"},
                    {url: process.env.URL_ISSUES, text: "Report a bug"},
                ]}
                onChange={newState => {
                    setState(prevState => ({
                        ...prevState,
                        ...newState,
                        updatedAt: Date.now(),
                    }));
                }}
                onSave={() => handleFileSave()}
                onLoad={() => handleFileLoad()}
                onResetBoard={() => setState({createdAt: Date.now()})}
            />
            {welcomeVisible && (
                <Welcome
                    version={process.env.VERSION}
                    onLoad={() => handleFileLoad()}
                    onClose={() => setWelcomeVisible(false)}
                />
            )}
        </div>
    );
};

createRoot(document.getElementById("root")).render(<App />);
