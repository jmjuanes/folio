import React from "react";
import { loadFromJson } from "folio-react/lib/json.js";
import { useConfirm } from "folio-react/contexts/confirm.jsx";
import { useDialog } from "folio-react/contexts/dialogs.jsx";
import { useClient } from "../contexts/client.tsx";
import { useRouter } from "../contexts/router.tsx";
import { useToaster } from "../contexts/toaster.tsx";
import { useEventEmitter } from "./use-events.ts";
import { BoardRenameDialog } from "../components/board-rename.tsx";
import { CREATE_BOARD_MUTATION, DELETE_BOARD_MUTATION, UPDATE_BOARD_MUTATION } from "../graphql.ts";
import { ACTIONS, EVENT_NAMES } from "../constants.ts";

export type ActionDispatcher = (actionName: string, payload: any) => Promise<any>;

// export the actions hook
export const useActions = (): ActionDispatcher => {
    const eventEmitter = useEventEmitter();
    const client = useClient();
    const toaster = useToaster();
    const { showConfirm } = useConfirm();
    const { showDialog } = useDialog();
    const [ hash, redirect ] = useRouter();

    const actions = React.useMemo(() => ({
        [ACTIONS.CREATE_BOARD]: async () => {
            return client.graphql(CREATE_BOARD_MUTATION, { attributes: {}, content: "{}" })
                .then(response => {
                    redirect(response.data.createBoard.id);
                    eventEmitter(EVENT_NAMES.BOARD_ACTION, {
                        action: "create",
                        id: response.data.createBoard.id,
                        date: Date.now(),
                    });
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
                    eventEmitter(EVENT_NAMES.BOARD_ACTION, {
                        action: "import",
                        id: response.data.createBoard.id,
                        date: Date.now(),
                    });
                })
                .catch(error => {
                    toaster.error(error?.message || "An error occurred while creating the board.");
                });
        },
        [ACTIONS.DELETE_BOARD]: async (payload: any) => {
            return new Promise(resolve => {
                showConfirm({
                    title: "Delete Board",
                    message: `Are you sure you want to delete the board "${payload.board.attributes.name}"? This action cannot be undone.`,
                    confirmText: "Delete",
                    onConfirm: () => {
                        client.graphql(DELETE_BOARD_MUTATION, { id: payload.board.id })
                            .then(() => {
                                // if the deleted board is the current one, redirect to the home page
                                if (payload.board.id === hash) {
                                    redirect("");
                                }
                                toaster.success("Board deleted successfully.");
                                eventEmitter(EVENT_NAMES.BOARD_ACTION, {
                                    action: "delete",
                                    id: payload.board.id,
                                    date: Date.now(),
                                });
                            })
                            .catch(error => {
                                toaster.error(error?.message || "An error occurred while deleting the board.");
                            })
                            .finally(() => resolve(null));
                    },
                });
            });
        },
        [ACTIONS.UPDATE_BOARD_ATTRIBUTES]: async ({ id, attributes = {} }) => {
            return client.graphql(UPDATE_BOARD_MUTATION, { id, attributes }).then(response => {
                eventEmitter(EVENT_NAMES.BOARD_ACTION, {
                    action: "updateAttributes",
                    id: response.data.updateBoard.id,
                    date: Date.now(),
                });
            });
        },
        [ACTIONS.UPDATE_BOARD_CONTENT]: async ({ id, content = "{}" }) => {
            return client.graphql(UPDATE_BOARD_MUTATION, { id, content: content });
        },
        [ACTIONS.SHOW_RENAME_BOARD_DIALOG]: async (payload: any) => {
            return showDialog({
                component: BoardRenameDialog,
                dialogClassName: "w-full max-w-sm",
                props: {
                    id: payload.board.id,
                    board: payload.board,
                },
            });
        },

    }), [ hash ]);

    // return a callback method to dispatch an action
    return React.useCallback<ActionDispatcher>((actionName: string, payload: any = {}): Promise<any> => {
        return actions[actionName](payload);
    }, [ actions ]);
};
