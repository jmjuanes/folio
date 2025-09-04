import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import { Title } from "folio-react/components/title.tsx";
import { Loading } from "../../../folio-react/components/loading.jsx";
import { Welcome } from "./welcome.tsx";
import type { Store } from "../types/store.ts";

export type AppProps = {
    store: Store;
};

// internal method to change the document title
const setDocumentTitle = (title: string) => {
    document.title = `${title} - folio lite`;
};

export const App = (props: AppProps): React.JSX.Element => {
    const [ ready, setReady ] = React.useState<boolean>(false);
    const currentTitle = React.useRef<string>("Untitled");
    const componentsOverrides = React.useMemo(() => {
        return {
            Title: Title,
            OverTheCanvas: Welcome,
        };
    }, [ props.store ]);

    // this is a wrapper around store.getInitialData to get and update the document title
    const handleDataLoad = React.useCallback(() => {
        return props.store.getInitialData().then((data) => {
            if (data?.title) {
                setDocumentTitle(data.title);
                currentTitle.current = data.title;
            }
            return data;
        });
    }, [ props.store ]);

    // when the data in the editor changes, run store.updateData
    const handleDataChange = React.useCallback((data: any) => {
        props.store.updateData(data);
        // update the document title if it has changed
        if (data?.title && data.title !== currentTitle.current) {
            setDocumentTitle(data.title);
            currentTitle.current = data.title;
        }
    }, [ props.store ]);

    // when the library in the editor changes, run store.updateLibrary
    const handleLibraryChange = React.useCallback((library: any) => {
        props.store.updateLibrary(library);
    }, [ props.store ]);

    // on mount, initialize the store
    React.useEffect(() => {
        props.store.initialize().then(() => {
            setReady(true);
        });
    }, [ props.store ]);

    if (!ready) {
        return (
            <Loading className="h-screen flex items-center justify-center" />
        );
    }

    return (
        <Editor
            data={handleDataLoad}
            library={props.store.getInitialLibrary}
            onChange={handleDataChange}
            onLibraryChange={handleLibraryChange}
            components={componentsOverrides}
        />
    );
};
