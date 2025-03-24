import React from "react";
import {ACTIONS} from "../constants.js";
import {useEditor} from "../contexts/editor.jsx";
import {useConfirm} from "../contexts/confirm.jsx";
import {useDialog} from "../contexts/dialogs.jsx";
import {loadFromJson, saveAsJson} from "../lib/json.js";

// @description hook to dispatch an action in the editor
export const useActions = () => {
    const editor = useEditor();
    const {showConfirm} = useConfirm();
    const {showDialog} = useDialog();

    // @description list with all the available actions
    const actionsList = React.useMemo(() => {
        return {
            [ACTIONS.OPEN]: () => {
                const openFile = () => {
                    return loadFromJson()
                        .then(data => {
                            editor.fromJSON(data);
                            editor.dispatchChange();
                            editor.update();
                        })
                        .catch(error => console.error(error));
                };
                // Check if editor is empty
                if (editor.pages.length === 1 && editor.page.elements.length === 0) {
                    return openFile();
                }
                // If is not empty, display confirmation
                return showConfirm({
                    title: "Load new drawing",
                    message: "Changes made in this drawing will be lost. Do you want to continue?",
                    callback: () => openFile(),
                });
            },
            [ACTIONS.SAVE]: () => {
                return saveAsJson(editor.toJSON())
                    .then(() => console.log("Folio file saved"))
                    .catch(error => console.error(error));
            },
            [ACTIONS.CLEAR]: () => {
                return showConfirm({
                    title: "Delete all data",
                    message: "This will delete all the information of this board, including all pages and drawings. Do you want to continue?",
                    confirmText: "Yes, delete all data",
                    callback: () => {
                        editor.reset();
                        editor.dispatchChange();
                        editor.update();
                    },
                });
            },
            [ACTIONS.EXPORT_IMAGE]: (exportOptions = {}) => {
                showDialog("export", exportOptions);
            },
            [ACTIONS.UNDO]: () => {
                editor.undo();
                editor.dispatchChange();
                editor.update();
            },
            [ACTIONS.REDO]: () => {
                editor.redo();
                editor.dispatchChange();
                editor.update();
            },
        };
    }, [editor, showConfirm, showDialog]);

    // @description dispatch a single action
    return React.useCallback((actionName, payload) => {
        if (actionsList[actionName]) {
            actionsList[actionName](payload);
        }
    }, [editor, actionsList]);
};
