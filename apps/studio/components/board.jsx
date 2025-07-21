import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import { Loading } from "folio-react/components/loading.jsx";
import { useClient } from "../contexts/client.jsx";
import { NotFound } from "./not-found.jsx";

export const Board = props => {
    const [exists, setExists] = React.useState(null);
    const client = useClient();

    // handle loading data from api
    const handleDataLoad = React.useCallback(() => {
        return client.getBoard(props.id).then(board => {
            return board.content;
        });
    }, [props.id, client]);

    const handleLibraryLoad = React.useCallback(() => {
        return client.getUserLibrary().then(library => {
            return library?.content || {};
        });
    }, [props.id, client]);

    // handle saving data or library
    const handleDataChange = React.useCallback(data => {
        return client.updateBoard(props.id, data);
    }, [props.id, client]);

    const handleLibraryChange = React.useCallback(data => {
        return client.updateUserLibrary(data);
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
                .then(() => setExists(true))
                .catch(error => {
                    console.error(error);
                    setExists(false); // Assume board does not exist on error
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
        return <Loading />;
    }

    // if the board does not exist, we display a centered message
    if (!exists) {
        return <NotFound />;
    }

    return (
        <Editor
            key={props.id}
            data={handleDataLoad}
            library={handleLibraryLoad}
            onChange={handleDataChange}
            onLibraryChange={handleLibraryChange}
        />
    );
};
