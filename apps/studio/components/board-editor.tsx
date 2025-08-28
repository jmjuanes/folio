import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import { Loading } from "folio-react/components/loading.jsx";
import { Client, useClient } from "../contexts/client.tsx";
import { useActions } from "../hooks/use-actions.ts";
import { NotFound } from "./not-found.tsx";
import { ACTIONS } from "../constants.ts";

export const BoardEditor = (props: any): React.JSX.Element => {
    const [ initialData, setInitialData ] = React.useState<any>(null);
    const [ exists, setExists ] = React.useState<boolean>(null);
    const client = useClient() as Client;
    const dispatchAction = useActions();

    // const handleLibraryLoad = React.useCallback(() => {
    //     return client.getUserLibrary().then(library => {
    //         return library?.content || {};
    //     });
    // }, [props.id, client]);

    // handle saving data or library
    const handleDataChange = React.useCallback(data => {
        return dispatchAction(ACTIONS.UPDATE_BOARD, {
            id: props.id,
            data: JSON.stringify(data),
        });
        // return client.graphql(UPDATE_BOARD_MUTATION, payload).catch(error => {
        //     console.error("Error updating board:", error);
        // });
    }, [ props.id, client, dispatchAction ]);

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
            dispatchAction(ACTIONS.GET_BOARD, { id: props.id })
                .then(board => {
                    if (board?.id) {
                        setInitialData(board);
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
    }, [props.id, client]);

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
