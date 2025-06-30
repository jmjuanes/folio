import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import { Welcome } from "./welcome.jsx";

export const Demo = props => {
    const [ready, setReady] = React.useState(false);
    const componentsOverrides = React.useMemo(() => ({
        OverTheCanvas: Welcome,
    }), [props.store]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = React.useCallback(data => {
        return props.store.updateData(data);
    }, [props.store]);

    // when the library in the editor changes, run store.updateLibrary
    const handleLibraryChange = React.useCallback(library => {
        return props.store.updateLibrary(library);
    }, [props.store]);

    // on mount, initialize the store
    React.useEffect(() => {
        props.store.initialize().then(() => {
            return setReady(true);
        });
    }, [props.store]);

    if (!ready) {
        return null;
    }

    return (
        <Editor
            data={props.store.getInitialData}
            library={props.store.getInitialLibrary}
            onChange={handleDataChange}
            onLibraryChange={handleLibraryChange}
            components={componentsOverrides}
        />
    );
};
