import React from "react";
import { loadFromJson } from "folio-react/lib/json.js";
import { useConfirm } from "folio-react/contexts/confirm.jsx";
import { useDialog } from "folio-react/contexts/dialogs.jsx";
import { useClient } from "../contexts/client.tsx";
import { useRouter } from "../contexts/router.tsx";
import { useToaster } from "../contexts/toaster.tsx";
import { BoardRenameDialog } from "../components/board-rename.tsx";
import { GET_USER_BOARDS_QUERY, CREATE_BOARD_MUTATION, DELETE_BOARD_MUTATION } from "../graphql.ts";
import { ACTIONS } from "../constants.ts";

export type ActionDispatcher = (actionName: string, payload: any) => Promise<any>;

// export the actions hook
export const useActions = (): ActionDispatcher => {
    const client = useClient();
    const toaster = useToaster();
    const [ hash, redirect ] = useRouter();

    const actions = React.useMemo(() => ({
        [ACTIONS.CREATE_BOARD]: async () => {
            return client.graphql(CREATE_BOARD_MUTATION, { attributes: {}, content: "{}" })
                .then(response => {
                    redirect(response.data.createBoard.id);
                    return response.data.createBoard;
                })
                .catch(error => {
                    toaster.error(error?.message || "An error occurred while creating the board.");
                });
        },
        [ACTIONS.IMPORT_BOARD]: async () => {
            return loadFromJson().
                then(boardData => {
                    return client.graphql(CREATE_BOARD_MUTATION, {
                        attributes: {
                            name: boardData?.title || "Untitled",
                        },
                        content: JSON.stringify(boardData),
                    });
                })
                .then(response => {
                    redirect(response.data.createBoard.id);
                    return response.data.createBoard;
                })
                .catch(error => {
                    toaster.error(error?.message || "An error occurred while creating the board.");
                });
        },
    }), []);

    // return a callback method to dispatch an action
    return React.useCallback<ActionDispatcher>((actionName: string, payload: any = {}): Promise<any> => {
        return actions[actionName](payload);
    }, [ actions ]);
};
