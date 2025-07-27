import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import { Loading } from "../../../folio-react/components/loading.jsx";
import { Welcome } from "./welcome.tsx";
import type { Store } from "../types/store.ts";

export type AppProps = {
    store: Store;
};

export const App = (props: AppProps): React.JSX.Element => {
    const [ready, setReady] = React.useState<boolean>(false);
    const componentsOverrides = React.useMemo(() => {
        return {
            OverTheCanvas: Welcome,
        };
    }, [props.store]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = React.useCallback((data: any) => {
        props.store.updateData(data);
    }, [props.store]);

    // when the library in the editor changes, run store.updateLibrary
    const handleLibraryChange = React.useCallback((library: any) => {
        props.store.updateLibrary(library);
    }, [props.store]);

    // on mount, initialize the store
    React.useEffect(() => {
        props.store.initialize().then(() => {
            setReady(true);
        });
    }, [props.store]);

    if (!ready) {
        return (
            <Loading className="h-screen flex items-center justify-center" />
        );
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
