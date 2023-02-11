import React from "react";
import classNames from "classnames";
import {exportToFile} from "folio-core";
import {Board} from "folio-board";

import {Header} from "./Header.jsx";
import {Loading} from "./Loading.jsx";
import {Welcome} from "./Welcome.jsx";
import {Modal} from "./Modal.jsx";
import {useDebounce} from "../hooks/useDebounce.js";
import {useDelay} from "../hooks/useDelay.js";
import {useToast} from "../contexts/ToastContext.jsx";
import {useConfirm} from "../contexts/ConfirmContext.jsx";
import {getStore} from "../data/store.js";
import {loadFromFileSystem, saveToFilesystem} from "../data/filesystem.js";

export const Editor = props => {
    const storeRef = React.useRef(null);
    const [state, setState] = React.useReducer((prev, state) => ({...prev, ...state}), {});
    const [loadingVisible, setLoadingVisible] = React.useState(true);
    const [welcomeVisible, setWelcomeVisible] = React.useState(false);
    const {addToast} = useToast();
    const {showConfirm} = useConfirm();

    const classList = classNames({
        "position:fixed top:0 left:0 h:full w:full": true,
        "bg:white text:base text:dark-700": true,
        "blur:md": loadingVisible || welcomeVisible,
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
                setLoadingVisible(false);
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
        <React.Fragment>
            <div className={classList}>
                <Board
                    key={state.id ?? ""}
                    elements={state?.elements || []}
                    assets={state?.assets || {}}
                    background={state?.background}
                    grid={state?.grid ?? true}
                    header={(
                        <Header
                            exportDisabled={(state?.elements || []).length === 0}
                            onExport={format => {
                                if (state?.elements?.length > 0) {
                                    return exportToFile(state, {
                                        format: format,
                                    });
                                }
                            }}
                            onSaveFile={() => {
                                return saveToFilesystem(state);
                            }}
                            onLoadFile={() => {
                                // Check if a change has been made to the board
                                if (state?.elements?.length > 0) {
                                    return showConfirm("Changes made in this board will be lost. Do you want to continue?").then(() => {
                                        return handleFileLoad();
                                    });
                                }
                                // Just load the new folio file
                                handleFileLoad();
                            }}
                            onDiscard={() => {
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
                    )}
                    onChange={newData => {
                        return setState(newData);
                    }}
                />
            </div>
            {loadingVisible && (
                <Loading />
            )}
            {welcomeVisible && !loadingVisible && (
                <Modal maxWidth="720px">
                    <Welcome
                        onClose={() => setWelcomeVisible(false)}
                    />
                </Modal>
            )}
        </React.Fragment>
    );
};
