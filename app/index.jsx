import React from "react";
import {createRoot} from "react-dom/client";
import classNames from "classnames";
import {exportToFile} from "folio-core";
import {Board} from "folio-board";

import {useDebounce} from "./hooks/useDebounce.js";
import {useDelay} from "./hooks/useDelay.js";
import {getStore} from "./data/store.js";
import {loadFromFileSystem, saveToFilesystem} from "./data/filesystem.js";

const App = () => {
    const storeRef = React.useRef(null);
    const [state, setState] = React.useReducer((prev, state) => ({...prev, ...state}), {});
    // const [loadingVisible, setLoadingVisible] = React.useState(true);
    // const [welcomeVisible, setWelcomeVisible] = React.useState(false);

    const classList = classNames({
        "position:fixed top:0 left:0 h:full w:full": true,
        "bg:white text:base text:dark-700": true,
        // "blur:md": loadingVisible,
    });

    // Debounce the data saving to store
    useDebounce(state, 250, () => {
        state?.id && storeRef.current.set(state);
    });

    // Initialize board store
    useDelay(100, () => {
        storeRef.current = getStore();
        storeRef.current.init()
            .then(() => storeRef.current.get())
            .then(prevState => {
                setState({...prevState, id: Date.now()});
                // Check if is the first time in the application
                // We will display the welcome message
                // if (!prevState?.elements || prevState?.elements?.length === 0) {
                //     setWelcomeVisible(true);
                // }
                // setLoadingVisible(false);
            });
    });

    // Handle file load
    const handleFileLoad = async () => {
        const data = await loadFromFileSystem();
        if (data) {
            return setState({...data, id: Date.now()});
        }
    };

    return (
        <div className={classList}>
            <Board
                key={state.id ?? ""}
                elements={state?.elements || []}
                assets={state?.assets || {}}
                onChange={newData => setState(newData)}
                onExport={format => {
                    if (state?.elements?.length > 0) {
                        return exportToFile(state, {
                            format: format,
                        });
                    }
                }}
                onSave={() => saveToFilesystem(state)}
                onLoad={() => {
                    // Check if a change has been made to the board
                    if (state?.elements?.length > 0) {
                        // return showConfirm("Changes made in this board will be lost. Do you want to continue?").then(() => {
                        //     return handleFileLoad();
                        // });
                    }
                    // Just load the new folio file
                    handleFileLoad();
                }}
                onReset={() => {
                    if (state?.elements?.length > 0) {
                        return showConfirm("This will clear the whole board. Do you want to continue?").then(() => {
                            setState({
                                elements: [],
                                assets: {},
                                id: Date.now(),
                            });
                        });
                    }
                }}
            />
        </div>
    );
};

const root = document.getElementById("root");

// Mount app
createRoot(root).render((<App />));
