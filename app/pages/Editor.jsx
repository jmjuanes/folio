import React from "react";
import Rouct from "rouct";
import classNames from "classnames";
import {Board} from "folio-board";

import {Header} from "../components/Header.jsx";
import {Loading} from "../components/Loading.jsx";
import {Projects} from "../components/Projects.jsx";
import {Welcome} from "../components/Welcome.jsx";
import {Modal} from "../components/Modal.jsx";
import {useClient} from "../contexts/ClientContext.jsx";
import {useDebounce} from "../hooks/useDebounce.js";
import {useDelay} from "../hooks/useDelay.js";
import {useToast} from "../contexts/ToastContext.jsx";
import {useConfirm} from "../contexts/ConfirmContext.jsx";

const useEditorState = () => {
    return React.useReducer((prev, state) => ({...prev, ...state}), {
        title: "Untitled",
    });
};

export const Editor = props => {
    const isDraft = !props.id || props.id === "draft";
    const [state, setState] = useEditorState();
    const [loadingVisible, setLoadingVisible] = React.useState(true);
    const [projectsVisible, setProjectsVisible] = React.useState(false);
    const [welcomeVisible, setWelcomeVisible] = React.useState(!props.id);
    const client = useClient();
    const {addToast} = useToast();
    const {showConfirm} = useConfirm();
    const classList = classNames({
        "position:fixed top:0 left:0 h:full w:full": true,
        "bg:white text:base text:dark-700": true,
        "blur:md": loadingVisible || welcomeVisible || projectsVisible,
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
                            newDraftDisabled={isDraft}
                            saveVisible={isDraft}
                            saveDisabled={(state?.elements || []).length === 0}
                            exportDisabled={(state?.elements || []).length === 0}
                            onExport={format => {
                                return null;
                            }}
                            onNewDraft={() => {
                                Rouct.redirect("/draft");
                            }}
                            onNewProject={() => {
                                if (isDraft && state?.elements?.length > 0) {
                                    showConfirm("Changes made in this draft will be lost. Do you want to continue?").then(() => {
                                        // TODO
                                    });
                                }
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
                <Modal maxWidth="720px" onClose={() => setProjectsVisible(false)}>
                    <div className="text:5xl mb:8 select:none">
                        <strong>Projects</strong>
                    </div>
                    <Projects
                        current={state.id ?? ""}
                        onLoad={id => {
                            Rouct.redirect(`/${id}`);
                        }}
                    />
                </Modal>
            )}
            {welcomeVisible && (
                <Modal maxWidth="720px" onClose={() => setWelcomeVisible(false)}>
                    <Welcome
                        onClose={() => setWelcomeVisible(false)}
                    />
                </Modal>
            )}
        </React.Fragment>
    );
};

Editor.defaultProps = {
    id: null,
};
