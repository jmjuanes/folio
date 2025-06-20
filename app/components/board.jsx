import React from "react";
import {Editor} from "folio-react/components/editor.jsx";
import {useStore} from "../hooks/use-store.js";
import {NotFound} from "./not-found.jsx";

// @description board component
export const Board = props => {
    const [exists, setExists] = React.useState(null);
    const store = useStore(props.id);

    // on mount, check if the board exists
    React.useEffect(() => {
        store.exists()
            .then(() => setExists(true))
            .catch(error => {
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
