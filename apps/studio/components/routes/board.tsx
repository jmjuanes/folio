import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import { Loading } from "folio-react/components/loading.jsx";
import { useAppState } from "../../contexts/app-state.tsx";
import { NotFound } from "../not-found.tsx";

export const BoardRoute = (props: any): React.JSX.Element => {
    const [ initialData, setInitialData ] = React.useState<any>(null);
    const [ exists, setExists ] = React.useState<boolean>(null);
    const { app } = useAppState();

    // const handleLibraryLoad = React.useCallback(() => {
    //     return client.getUserLibrary().then(library => {
    //         return library?.content || {};
    //     });
    // }, [props.id, client]);

    // handle saving data or library
    const handleDataChange = React.useCallback(data => {
        app.updateBoard(props.id, JSON.stringify(data));
    }, [ props.id, app ]);

    // const handleLibraryChange = React.useCallback(data => {
    //     return client.updateUserLibrary(data);
    // }, [props.id, client]);

    // on mount, check if the board exists
    // it includes a little protection against rapid board entering/exit
    React.useEffect(() => {
        let didEnter = true; // if it changes to false, stop loading board
        const timer = window.setTimeout(() => {
            if (!didEnter) {
                return;
            }
            // check if board exists and get the initial data
            app.getBoard(props.id)
                .then(boardData => {
                    if (boardData?.id) {
                        setInitialData(boardData);
                        setExists(true);
                    }
                    else {
                        setInitialData({});
                        setExists(false);
                    }
                })
                .catch(error => {
                    console.error(error);
                    setInitialData({});
                    setExists(false); // Assume board does not exist on error
                });
        }, 1200);
        // on unmount, clear the timer and stop checking if board exists
        return () => {
            window.clearTimeout(timer);
            didEnter = false;
        };
    }, [ props.id, app ]);

    // we do not know (yet) if the board exists, so we set it to null
    if (exists === null || initialData === null) {
        return <Loading />;
    }

    // if the board does not exist, we display a centered message
    if (!exists) {
        return <NotFound />;
    }

    return (
        <Editor
            key={props.id}
            data={() => {
                return JSON.parse(initialData?.data || "{}");
            }}
            onChange={handleDataChange}
        />
    );
};
