import React from "react";
import {ACTIONS, ZOOM_STEP} from "../constants.js";
import {useEditor} from "../contexts/editor.jsx";
import {useConfirm} from "../contexts/confirm.jsx";
import {useDialog} from "../contexts/dialogs.jsx";
import {useEditorComponents} from "../contexts/editor-components.jsx";
import {loadFromJson, saveAsJson} from "../lib/json.js";

// @description hook to dispatch an action in the editor
export const useActions = () => {
    const editor = useEditor();
    const {showConfirm} = useConfirm();
    const {showDialog} = useDialog();
    const {
        KeyboardShortcutsDialog,
        PreferencesDialog,
        ExportDialog,
        LibraryAddDialog,
        LibraryExportDialog,
        PageEditDialog,
    } = useEditorComponents();

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
            [ACTIONS.ZOOM_IN]: () => {
                editor.setZoom(editor.getZoom() + ZOOM_STEP);
                editor.update();
            },
            [ACTIONS.ZOOM_OUT]: () => {
                editor.setZoom(editor.getZoom() - ZOOM_STEP);
                editor.update();
            },
            [ACTIONS.ZOOM_RESET]: () => {
                editor.resetZoom();
                editor.update();
            },
            [ACTIONS.ZOOM_FIT]: () => {
                editor.fitZoomToSelection();
                editor.update();
            },
            [ACTIONS.ZOOM_FIT_SELECTION]: () => {
                editor.fitZoomToSelection(editor.getSelection());
                editor.update();
            },
            [ACTIONS.SELECT_ALL]: () => {
                editor.getElements().forEach(el => el.selected = true);
                editor.update();
            },
            [ACTIONS.DELETE_SELECTION]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.removeElements(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.DUPLICATE_SELECTION]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.duplicateElements(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.LOCK_SELECTION]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.lockElements(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.UNLOCK_SELECTION]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.unlockElements(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.GROUP_SELECTION]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 1) {
                    editor.groupElements(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.UNGROUP_SELECTION]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.ungroupElements(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.BRING_FORWARD]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.bringElementsForward(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.BRING_TO_FRONT]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.bringElementsToFront(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.SEND_BACKWARD]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.sendElementsBackward(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.SEND_TO_BACK]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.sendElementsToBack(selectedElements);
                    editor.dispatchChange();
                    editor.update();
                }
            },
            [ACTIONS.CUT]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.cutElementsToClipboard(selectedElements).then(() => {
                        editor.dispatchChange();
                        editor.update();
                    });
                }
            },
            [ACTIONS.COPY]: () => {
                const selectedElements = editor.getSelection();
                if (selectedElements.length > 0) {
                    editor.copyElementsToClipboard(selectedElements).then(() => {
                        editor.dispatchChange();
                        editor.update();
                    });
                }
            },
            [ACTIONS.PASTE]: ({event = null, position = null}) => {
                editor.pasteElementsFromClipboard(event, position).then(() => {
                    editor.dispatchChange();
                    editor.update();
                });
            },
            [ACTIONS.CREATE_PAGE]: () => {
                editor.addPage({});
                editor.dispatchChange();
                editor.update();
            },
            [ACTIONS.DELETE_PAGE]: ({page = null}) => {
                const pageToDelete = page || editor.page; // if no page is provided, use the current page
                return showConfirm({
                    title: "Delete page",
                    message: `Do you want to delete '${pageToDelete.title}'? This action can not be undone.`,
                    callback: () => {
                        editor.removePage(pageToDelete);
                        editor.dispatchChange();
                        editor.update();
                    },
                });
            },
            [ACTIONS.DUPLICATE_PAGE]: ({page = null}) => {
                const pageToDuplicate = page || editor.page; // if no page is provided, use the current page
                editor.duplicatePage(pageToDuplicate);
                editor.dispatchChange();
                editor.update();
            },
            [ACTIONS.CLEAR_PAGE]: ({page = null}) => {
                const pageToClear = page || editor.page; // if no page is provided, use the current page
                return showConfirm({
                    title: "Clear Page",
                    message: "This will remove all elements of this page. Do you want to continue?",
                    confirmText: "Yes, clear page",
                    callback: () => {
                        editor.clearPage(pageToClear.id);
                        editor.dispatchChange();
                        editor.update();
                    },
                });
            },
            [ACTIONS.NEXT_PAGE]: () => {
                const currentPageIndex = editor.pages.findIndex(page => page.id === editor.page.id);
                if (currentPageIndex < editor.pages.length - 1) {
                    editor.setActivePage(editor.pages[currentPageIndex + 1]);
                    editor.update();
                }
            },
            [ACTIONS.PREVIOUS_PAGE]: () => {
                const currentPageIndex = editor.pages.findIndex(page => page.id === editor.page.id);
                if (currentPageIndex > 0) {
                    editor.setActivePage(editor.pages[currentPageIndex - 1]);
                    editor.update();
                }
            },
            [ACTIONS.TOGGLE_GRID]: () => {
                editor.appState.grid = !editor.appState?.grid;
                editor.dispatchChange();
                editor.update();
            },
            [ACTIONS.TOGGLE_SNAP_TO_ELEMENTS]: () => {
                editor.appState.snapToElements = !editor.appState?.snapToElements;
                editor.dispatchChange();
                editor.update();
            },
            [ACTIONS.TOGGLE_SHOW_DIMENSIONS]: () => {
                editor.appState.objectDimensions = !editor.appState?.objectDimensions;
                editor.dispatchChange();
                editor.update();
            },
            [ACTIONS.SHOW_KEYBOARD_SHORTCUTS_DIALOG]: () => {
                showDialog({
                    dialogClassName: "w-full max-w-sm",
                    component: KeyboardShortcutsDialog,
                });
            },
            [ACTIONS.SHOW_PREFERENCES_DIALOG]: () => {
                showDialog({
                    dialogClassName: "w-full max-w-md",
                    component: PreferencesDialog,
                });
            },
            [ACTIONS.SHOW_EXPORT_DIALOG]: exportOptions => {
                showDialog({
                    dialogClassName: "w-full max-w-md",
                    component: ExportDialog,
                    props: exportOptions,
                });
            },
            [ACTIONS.SHOW_LIBRARY_ADD_DIALOG]: () => {
                showDialog({
                    dialogClassName: "w-full max-w-md",
                    component: LibraryAddDialog,
                });
            },
            [ACTIONS.SHOW_LIBRARY_EXPORT_DIALOG]: () => {
                showDialog({
                    dialogClassName: "w-full max-w-md",
                    component: LibraryExportDialog,
                });
            },
            [ACTIONS.SHOW_PAGE_EDIT_DIALOG]: pageOptions => {
                if (pageOptions?.page?.id) {
                    showDialog({
                        dialogClassName: "w-full max-w-md",
                        component: PageEditDialog,
                        props: pageOptions,
                    });
                }
            },
        };
    }, [editor, showConfirm, showDialog]);

    // @description dispatch a single action
    return React.useCallback((actionName, payload = {}) => {
        if (actionsList[actionName]) {
            actionsList[actionName](payload);
        }
    }, [editor, actionsList]);
};
