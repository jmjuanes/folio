import React from "react";
import {Board} from "folio-board";

import {Header} from "./Header/index.jsx";
import {useClient} from "../contexts/ClientContext.jsx";
import {useDebounce} from "../hooks/useDebounce.js";
import {useDelay} from "../hooks/useDelay.js";

export const Editor = props => {
    const [state, setState] = React.useState(null);
    const client = useClient();

    // Debounce the data saving to database
    useDebounce(state, 250, () => {
        state?.id && client.update(state.id, state);
    });

    // Initialize board --> import current project data
    useDelay(1000, () => {
        client.get(props.id).then(project => {
            setState({...project});
        });
    });

    return (
        <div className="bg:white text:base text:dark-700 position:fixed top:0 left:0 h:full w:full">
            <Board
                key={state?.id || "draft"}
                elements={state?.elements || []}
                assets={state?.assets || {}}
                background={state?.background}
                grid={state?.grid ?? true}
                header={(
                    <Header
                        title={state?.title || "Untitled"}
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
    );
};

Editor.defaultProps = {
    id: null,
};
