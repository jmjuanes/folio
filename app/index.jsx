import React from "react";
import {createRoot} from "react-dom/client";
import classNames from "classnames";
import * as idb from "idb-keyval";
import {fileOpen, fileSave} from "browser-fs-access";
import {VERSION, MIME_TYPES, FILE_EXTENSIONS, EXPORT_FORMATS} from "folio-core";
import {exportToFile, exportToClipboard} from "folio-core";
import {Board} from "folio-board";
import {ToastProvider, useToast} from "folio-board";
import {ConfirmProvider, useConfirm} from "folio-board";

// Store keys for IDB
const STORE_KEYS = {
    VERSION: "version",
    STATE: "state",
};

// Global store
const store = idb.createStore("folio", "folio-store");

const App = props => {
    const {addToast} = useToast();
    const {showConfirm} = useConfirm();
    const [state, setState] = React.useState({});
    const classList = classNames({
        "position:fixed top:0 left:0 h:full w:full": true,
        "bg:white text:base text:dark-700": true,
        // "blur:md": loadingVisible,
    });

    // Debounce the data saving to store
    React.useEffect(() => {
        const callback = () => {
            state.id && idb.set(STORE_KEYS.STATE, state, store);
        };
        const handler = setTimeout(() => callback(), props.delaySave);

        return () => clearTimeout(handler);
    }, [state]);

    // Initialize board store
    React.useEffect(() => {
        const initializeStore = async () => {
            if ((await idb.keys(store)).length === 0) {
                await idb.set("version", VERSION, store);
            }
            return true;
        };

        initializeStore()
            .then(() => idb.get(STORE_KEYS.STATE, store))
            .then(prevState => {
                setState({...prevState, id: Date.now()});
                // Check if is the first time in the application
                // We will display the welcome message
                // if (!prevState?.elements || prevState?.elements?.length === 0) {
                //     setWelcomeVisible(true);
                // }
                // setLoadingVisible(false);
            });
    }, []);

    // Handle file save
    const handleFileSave = () => {
        const content = JSON.stringify({
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
        fileSave(blob, options)
            .then(() => addToast("Board saved to file"))
            .catch(error => {
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
                // Load data
                return (new Promise(resolve => {
                    const file = new FileReader();
                    file.onload = event => {
                        resolve(JSON.parse(event.target.result));
                    };
                    file.readAsText(blob, "utf8");
                }));
            })
            .then(data => setState({...data, id: Date.now()}))
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div className={classList}>
            <Board
                key={state.id ?? ""}
                initialState={state}
                onChange={newState => {
                    setState(prevState => ({...prevState, ...newState}));
                }}
                onExport={format => {
                    if (state?.elements?.length > 0) {
                        return exportToFile({
                            elements: state.elements,
                            format: format,
                        });
                    }
                }}
                onScreenshot={region => {
                    if (state?.elements?.length > 0) {
                        const exportOptions = {
                            elements: state.elements,
                            format: EXPORT_FORMATS.PNG,
                            crop: region,
                        };
                        return exportToClipboard(exportOptions).then(() => {
                            addToast("Screenshot copied to clipboard");
                        });
                    }
                }}
                onSave={() => handleFileSave()}
                onLoad={() => {
                    if (state?.elements?.length > 0) {
                        return showConfirm("Changes made in this board will be lost. Do you want to continue?")
                            .then(() => handleFileLoad());
                    }
                    // Just load the new folio file
                    handleFileLoad();
                }}
                onReset={() => {
                    showConfirm("This will clear the whole board. Do you want to continue?")
                        .then(() => setState({id: Date.now()}));
                }}
            />
        </div>
    );
};

App.defaultProps = {
    delaySave: 250,
};

const root = document.getElementById("root");

// Mount app
createRoot(root).render((
    <ConfirmProvider>
        <ToastProvider>
            <App />
        </ToastProvider>
    </ConfirmProvider>
));
