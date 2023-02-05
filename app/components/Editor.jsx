import React from "react";
import classNames from "classnames";
import {Board} from "folio-board";

import {Header} from "./Header/index.jsx";
import {Loading} from "./commons/Loading.jsx";
import {useClient} from "../contexts/ClientContext.jsx";
import {useDebounce} from "../hooks/useDebounce.js";
import {useDelay} from "../hooks/useDelay.js";

export const Editor = props => {
    const [state, setState] = React.useState(null);
    const [loadingVisible, setLoadingVisible] = React.useState(true);
    const client = useClient();
    const classList = classNames({
        "position:fixed top:0 left:0 h:full w:full": true,
        "bg:white text:base text:dark-700": true,
        "blur:md": !props.id || loadingVisible,
    });

    // Debounce the data saving to database
    useDebounce(state, 250, () => {
        state?.id && client.update(state.id, state);
    });

    // Initialize board --> import current project data
    useDelay(1000, () => {
        client.get(props.id).then(project => {
            setState({...project});
            setLoadingVisible(false);
        });
    });

    return (
        <React.Fragment>
            <div className={classList}>
                <Board
                    key={state?.id || "draft"}
                    elements={state?.elements || []}
                    assets={state?.assets || {}}
                    background={state?.background}
                    grid={state?.grid ?? true}
                    header={(
                        <Header
                            title={state?.title || "Untitled"}
                            onTitleChange={newTitle => {
                                setState(prev => ({...prev, title: newTitle}));
                            }}
                            exportDisabled={(state?.elements || []).length === 0}
                            onExport={format => {
                                return null;
                            }}
                        />
                    )}
                    onChange={newData => {
                        setState(prev => ({...prev, ...newData}));
                    }}
                />
            </div>
            {loadingVisible && props.id && (
                <Loading />
            )}
        </React.Fragment>
    );
};

Editor.defaultProps = {
    id: null,
};
