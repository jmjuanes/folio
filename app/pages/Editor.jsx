import React from "react";
import Rouct from "rouct";
import classNames from "classnames";
import {Board} from "folio-board";

import {Header} from "../components/Header.jsx";
import {Loading} from "../components/Loading.jsx";
import {Projects} from "../components/Projects.jsx";
import {useClient} from "../contexts/ClientContext.jsx";
import {useDebounce} from "../hooks/useDebounce.js";
import {useDelay} from "../hooks/useDelay.js";
import {useToast} from "../contexts/ToastContext.jsx";

const useEditorState = initialState => {
    return React.useReducer((prev, state) => ({...prev, ...state}), initialState);
};

export const Editor = props => {
    const isDraft = !props.id || props.id === "draft";
    const [state, setState] = useEditorState({
        title: "Untitled",
    });
    const [loadingVisible, setLoadingVisible] = React.useState(true);
    const [projectsVisible, setProjectsVisible] = React.useState(false);
    const client = useClient();
    const {addToast} = useToast();
    const classList = classNames({
        "position:fixed top:0 left:0 h:full w:full": true,
        "bg:white text:base text:dark-700": true,
        "blur:md": !props.id || loadingVisible,
    });

    // Debounce the data saving to database
    useDebounce(state, 250, () => {
        state?.id && client.update(state.id, state);
    });

    // Initialize board data
    useDelay(100, () => {
        if (!isDraft) {
            return client.get(props.id).then(project => {
                setState(project);
                setLoadingVisible(false);
            });
        }
        // Hide loading
        setLoadingVisible(false);
    });

    return (
        <React.Fragment>
            <div className={classList}>
                <Board
                    key={state.id ?? "draft"}
                    elements={state?.elements || []}
                    assets={state?.assets || {}}
                    background={state?.background}
                    grid={state?.grid ?? true}
                    header={(
                        <Header
                            title={state?.title}
                            onTitleChange={newTitle => {
                                return setState({title: newTitle});
                            }}
                            saveVisible={props.draft}
                            saveDisabled={(state?.elements || []).length === 0}
                            exportDisabled={(state?.elements || []).length === 0}
                            onExport={format => {
                                return null;
                            }}
                            onNewDraft={() => {
                                return null;
                            }}
                            onNewProject={() => {
                                return null;
                            }}
                            onLoadProject={() => {
                                setProjectsVisible(true);
                            }}
                            onSave={() => {
                                client.create({...state}).then(id => {
                                    addToast(`Draft saved as a new project '${state.title}'.`);
                                    Rouct.redirect(`/${id}`);
                                });
                            }}
                            onDiscard={() => {
                                // TODO: display confirmation
                                // setState({elements: [], assets: {}});
                            }}
                        />
                    )}
                    onChange={newData => {
                        return setState(newData);
                    }}
                />
            </div>
            {loadingVisible && !isDraft && (
                <Loading />
            )}
            {projectsVisible && (
                <Projects
                    current={state.id ?? ""}
                    onClose={() => {
                        setProjectsVisible(false);
                    }}
                    onLoad={id => {
                        Rouct.redirect(`/${id}`);
                    }}
                />
            )}
        </React.Fragment>
    );
};

Editor.defaultProps = {
    id: null,
};
