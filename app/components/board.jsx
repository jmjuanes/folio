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
    React.useEffect(() => {
        client.getBoard(props.id)
            .then(() => setExists(true))
            .catch(error => {
                console.error(error);
                setExists(false); // Assume board does not exist on error
            });
    }, [store]);

    // we do not know (yet) if the board exists, so we set it to null
    if (exists === null) {
        return null;
    }

    // if the board does not exist, we display a centered message
    if (!exists) {
        return (
            <NotFound />
        );
    }

    return (
        <Editor
            store={store}
            components={{}}
        />
    );
};
