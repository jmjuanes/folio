import React from "react";
import { loadFromJson } from "folio-react/lib/json.js";
import { useConfirm } from "folio-react/contexts/confirm.jsx";
import { useDialog } from "folio-react/contexts/dialogs.jsx";
import { useClient } from "../contexts/client.tsx";
import { useRouter } from "../contexts/router.tsx";
import { useToaster } from "../contexts/toaster.tsx";
import { BoardRenameDialog } from "../components/board-rename.tsx";
import { ACTIONS, COLLECTIONS } from "../constants.ts";
import {
    GET_DOCUMENT_QUERY,
    ADD_DOCUMENT_MUTATION,
    UPDATE_DOCUMENT_MUTATION,
    DELETE_DOCUMENT_MUTATION,
    LIST_DOCUMENTS_QUERY,
} from "../graphql.ts";

export type ActionDispatcher = (actionName: string, payload: any) => Promise<any>;

// export the actions hook
export const useActions = (): ActionDispatcher => {
    const client = useClient();
    const toaster = useToaster();
    const { showConfirm } = useConfirm();
    const { showDialog } = useDialog();
    const [ hash, redirect ] = useRouter();

    const actions = React.useMemo(() => ({
        [ACTIONS.GET_BOARD]: async (payload: any) => {
            return Promise.resolve(null)
                .then(() => {
                    return client.graphql(GET_DOCUMENT_QUERY, {
                        collection: COLLECTIONS.BOARD,
                        id: payload.id,
                    });
                })
                .then(response => {
                    return response?.data?.getDocument || null;
                });
        },
        [ACTIONS.GET_RECENT_BOARDS]: async () => {
            return Promise.resolve(null)
                .then(() => {
                    return client.graphql(LIST_DOCUMENTS_QUERY, {
                        collection: COLLECTIONS.BOARD,
                    });
                })
                .then(response => {
                    return response?.data?.listDocuments || [];
                });
        },
        [ACTIONS.CREATE_BOARD]: async () => {
            return Promise.resolve(null)
                .then(() => {
                    return client.graphql(ADD_DOCUMENT_MUTATION, {
                        collection: COLLECTIONS.BOARD,
                        attributes: {
                            name: "Untitled",
                            preview: null,
                        },
                        data: JSON.stringify({}),
                    });
                })
                .then(response => {
                    redirect("b/" + response.data.addDocument.id);
                })
                .catch(error => {
                    toaster.error(error?.message || "An error occurred while creating the board.");
                });
        },
        [ACTIONS.IMPORT_BOARD]: async () => {
            return loadFromJson().
                then(boardData => {
                    return client.graphql(ADD_DOCUMENT_MUTATION, {
                        collection: COLLECTIONS.BOARD,
                        attributes: {
                            name: boardData?.title || "Untitled",
                            preview: null,
                        },
                        data: JSON.stringify(boardData || {}),
                    });
                })
                .then(response => {
                    redirect("b/" + response.data.addDocument.id);
                })
                .catch(error => {
                    toaster.error(error?.message || "An error occurred while creating the board.");
                });
        },
        [ACTIONS.DELETE_BOARD]: async (payload: any) => {
            return new Promise(resolve => {
                showConfirm({
                    title: "Delete Board",
                    message: `Are you sure you want to delete the board "${payload.name}"? This action cannot be undone.`,
                    confirmText: "Delete",
                    onConfirm: () => {
                        return Promise.resolve(null)
                            .then(() => {
                                return client.graphql(DELETE_DOCUMENT_MUTATION, {
                                    collection: COLLECTIONS.BOARD,
                                    id: payload.id,
                                });
                            })
                            .then(() => {
                                // if the deleted board is the current one, redirect to the home page
                                if (payload.id === hash) {
                                    redirect("");
                                }
                                toaster.success("Board deleted successfully.");
                            })
                            .catch(error => {
                                toaster.error(error?.message || "An error occurred while deleting the board.");
                            })
                            .finally(() => resolve(null));
                    },
                });
            });
        },
        [ACTIONS.UPDATE_BOARD]: async (payload: any) => {
            return client.graphql(UPDATE_DOCUMENT_MUTATION, {
                collection: COLLECTIONS.BOARD,
                id: payload.id,
                attributes: payload.attributes,
                data: payload.data,
            });
        },
        [ACTIONS.SHOW_RENAME_BOARD_DIALOG]: async (payload: any) => {
            return new Promise((resolve) => {
                return showDialog({
                    component: BoardRenameDialog,
                    dialogClassName: "w-full max-w-sm",
                    props: {
                        id: payload.id,
                        onSubmit: resolve,
                    },
                });
            });
        },
    }), [ hash ]);

    // return a callback method to dispatch an action
    return React.useCallback<ActionDispatcher>((actionName: string, payload: any = {}): Promise<any> => {
        return actions[actionName](payload);
    }, [ actions ]);
};
