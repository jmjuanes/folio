import React from "react";
import { Editor } from "folio-react/components/editor.jsx";
import { Loading } from "folio-react/components/loading.jsx";
import { Client, useClient } from "../contexts/client.tsx";
import { NotFound } from "./not-found.tsx";
import { GET_BOARD_QUERY, UPDATE_BOARD_MUTATION } from "../graphql.ts";

export const BoardEditor = (props: any): React.JSX.Element => {
    const [ initialData, setInitialData ] = React.useState<any>(null);
    const [ exists, setExists ] = React.useState<boolean>(null);
    const client = useClient() as Client;

    // const handleLibraryLoad = React.useCallback(() => {
    //     return client.getUserLibrary().then(library => {
    //         return library?.content || {};
    //     });
    // }, [props.id, client]);

    // handle saving data or library
    const handleDataChange = React.useCallback(data => {
        const payload = {
            id: props.id,
            name: data?.title || "Untitled",
            content: data,
        };
        return client.graphql(UPDATE_BOARD_MUTATION, payload).catch(error => {
            console.error("Error updating board:", error);
        });
    }, [props.id, client]);

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
            client.graphql(GET_BOARD_QUERY, { id: props.id })
                .then(response => {
                    if (response?.data?.board?._id) {
                        setInitialData(response.data.board);
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
                return initialData?.content || {};
            }}
            onChange={handleDataChange}
        />
    );
};
