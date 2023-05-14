import React from "react";
import {createRoot} from "react-dom/client";
import classNames from "classnames";
import * as idb from "idb-keyval";
import {fileOpen, fileSave} from "browser-fs-access";
import {VERSION, MIME_TYPES, FILE_EXTENSIONS} from "folio-core";
import {migrate, exportToFile} from "folio-core";
import {Board} from "folio-board";

// Store keys for IDB
const STORE_KEYS = {
    VERSION: "version",
    DATA: "data",
    STATE: "state",
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
            const newData = migrate(prevData, currentVersion);
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
    const classList = classNames({
        "position-fixed top-0 left-0 h-full w-full": true,
        "bg-white text-base text-gray-700": true,
        // "blur-md": loadingVisible,
    });

    // Debounce the data saving to store
    React.useEffect(() => {
        const callback = () => {
            state.createdAt && idb.set(STORE_KEYS.DATA, state, store);
        };
        const handler = setTimeout(() => callback(), props.delaySave);

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
        const content = JSON.stringify({
            version: VERSION,
            ...state,
            elements: state.elements || [],
            assets: state.assets || {},
        });
        const blob = new Blob([content], {
            type: MIME_TYPES.FOLIO,
        });
        const options = {
            description: "Folio board",
            fileName: `untitled${FILE_EXTENSIONS.FOLIO}`,
            extensions: [
                FILE_EXTENSIONS.FOLIO,
            ],
        };

        // Save to the file system
        fileSave(blob, options).catch(error => {
            console.error(error);
        });
    };

    // Handle file load
    const handleFileLoad = () => {
        const options = {
            description: "Folio Board",
            extensions: [
                FILE_EXTENSIONS.FOLIO,
            ],
            multiple: false,
        };
        fileOpen(options)
            .then(blob => {
                if (!blob) {
                    return Promise.reject(new Error("No file selected"));
                }
                const file = new FileReader();
                return (new Promise((resolve, reject) => {
                    file.onload = event => resolve(event.target.result);
                    file.onerror = error => reject(error);
                    file.readAsText(blob, "utf8");
                }));
            })
            .then(dataText => JSON.parse(dataText))
            .then(data => migrate(data, data.version))
            .then(data => {
                setState({createdAt: Date.now(), ...data});
                setWelcomeVisible(false);
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div className={classList}>
            <Board
                key={state.createdAt ?? ""}
                initialData={state}
                links={[
                    {url: process.env.URL_REPOSITORY, text: "About Folio"},
                    {url: process.env.URL_ISSUES, text: "Report a bug"},
                ]}
                showWelcome={welcomeVisible}
                onChange={newState => {
                    setState(prevState => ({
                        ...prevState,
                        ...newState,
                        updatedAt: Date.now(),
                    }));
                }}
                onExport={format => {
                    return exportToFile({
                        elements: state.elements,
                        format: format,
                    });
                }}
                onSave={() => handleFileSave()}
                onLoad={() => handleFileLoad()}
                onResetBoard={() => setState({createdAt: Date.now()})}
            />
        </div>
    );
};

App.defaultProps = {
    delaySave: 250,
};

const root = document.getElementById("root");

// Mount app
createRoot(root).render(<App />);
