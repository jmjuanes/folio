import React from "react";
import {Board as FolioBoard} from "folio-board";

import {useClient} from "../contexts/ClientContext.jsx";
import {useDebounce} from "../hooks/useDebounce.js";

export const Board = props => {
    const [state, setState] = React.useState(null);
    const client = useClient();

    // Debounce the data saving to database
    useDebounce(state, 250, () => {
        if (props.id) {
            return client.update(props.id, state);
        }
    });

    // Initialize board --> import current project data
    React.useEffect(() => {
        if (props.id) {
            client.get(props.id).then(project => {
                setState({...project});
            });
        }
        else {
            // Launch in draft mode --> no data is saved in database
            setState({});
        }
    }, []);

    // 

    return (
        <div className="bg:white text:base text:dark-700 position:fixed top:0 left:0 h:full w:full">
            {!!state && (
                <FolioBoard
                    key={props.id || "draft"}
                    id={state.id}
                    title={state.title || ""}
                    elements={state.elements || []}
                    assets={state.assets || {}}
                    background={state.background}
                    grid={state.grid ?? true}
                    onChange={newData => {
                        setState(prev => ({...prev, ...newData}));
                    }}
                />
            )}
        </div>
    );
};

Board.defaultProps = {
    id: null,
};
