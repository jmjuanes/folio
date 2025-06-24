import React from "react";
import {Editor} from "folio-react/components/editor.jsx";
import {useClient} from "../contexts/client.jsx";
import {NotFound} from "./not-found.jsx";

// @description board component
export const Board = props => {
    const [exists, setExists] = React.useState(null);
    const client = useClient();
    const store = React.useMemo(() => {
        return {
            initialize: () => {
                return Promise.resolve(true);
            },
            // manage board data
            data: {
                get: () => {
                    return client.getBoardData(props.id);
                },
                set: data => {
                    return client.updateBoardData(props.id, data);
                },
            },
        };
    }, [props.id, client]);

    // on mount, check if the board exists
    // it includes a little protection against rapid board entering/exit
    React.useEffect(() => {
        let didEnter = true; // if it changes to false, stop loading board
        const timer = window.setTimeout(() => {
            if (!didEnter) {
                return;
            }
            // check if board exists
            client.getBoard(props.id)
                .then(() => {
                    if (didEnter) {
                        setExists(true);
                    }
                })
                .catch(error => {
                    console.error(error);
                    if (didEnter) {
                        setExists(false); // Assume board does not exist on error
                    }
                });
        }, 1200);
        
        // on unmount, clear the timer and stop checking if board exists
        return () => {
            window.clearTimeout(timer);
            didEnter = false;
        };
    }, [props.id, client]);

    // we do not know (yet) if the board exists, so we set it to null
    if (exists === null) {
        return null;
    }

    // if the board does not exist, we display a centered message
    if (!exists) {
        return <NotFound />;
    }

    return (
        <Editor
            key={props.id}
            store={store}
            components={{}}
        />
    );
};
