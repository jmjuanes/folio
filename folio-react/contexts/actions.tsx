import React from "react";
import { uid } from "uid/secure";
import { ACTIONS, ZOOM_STEP, TOOLS, FORM_OPTIONS } from "../constants.js";
import { useEditor } from "./editor.tsx";
import { useConfirm } from "./confirm.jsx";
import { useDialog } from "./dialogs.tsx";
import { useLibrary } from "./library.tsx";
import { useEditorComponents } from "./editor-components.tsx";
import { useSurface } from "./surface.tsx";
import { usePrompt } from "../hooks/use-prompt.tsx";
import { loadFromJson, saveAsJson } from "../lib/json.js";
import { loadLibraryFromJson, saveLibraryAsJson } from "../lib/library.ts";
import type { LibraryCollection } from "../lib/library.ts";

export enum ActionCategory {
    EDITION = "Edition",
    BOARD_ACTIONS = "Board Actions",
    SETTINGS = "Settings",
};

export type ActionItem = {
    id: string;
    name: string;
    category?: ActionCategory;
    icon?: React.JSX.Element | React.ReactNode | string;
    shortcut?: string;
    onSelect: (payload?: any) => void;
};

export type ActionsOverrides = ActionItem[] | ((editor: any, defaultActions: ActionItem[]) => ActionItem[]);

export type ActionsProviderProps = {
    overrides?: ActionsOverrides;
    children: React.ReactNode;
};

export type ActionsManager = {
    getActions: () => ActionItem[];
    getActionById: (actionId: string) => ActionItem | null;
    getActionByShortcut: (shortcut: string) => ActionItem | null;
    dispatchAction: (actionId: string, payload?: any) => void;
};

export const ActionsContext = React.createContext<ActionsManager | null>(null);

export const useActions = (): ActionsManager => {
    const actions = React.useContext(ActionsContext);
    if (!actions) {
        throw new Error("Cannot call 'useActions' outside <ActionsProvider>.");
    }
    return actions;
};

const getLibraryComponentFields = (collections: LibraryCollection[]) => {
    return {
        name: {
            type: FORM_OPTIONS.TEXT,
            title: "Component name",
        },
        description: {
            type: FORM_OPTIONS.TEXTAREA,
            title: "Short description of the component",
        },
        collection: {
            type: FORM_OPTIONS.DROPDOWN_SELECT,
            title: "Collection",
            values: collections.map(collection => ({
                value: collection.id,
                text: collection.name,
            })),
            allowToRemove: true,
            emptyValueText: collections.length === 0 ? "No collections available" : "Select a collection",
        },
    };
};



export const ActionsProvider = (props: ActionsProviderProps): React.JSX.Element => {
    const editor = useEditor();
    const library = useLibrary();
    const prompt = usePrompt();
    const { showConfirm } = useConfirm();
    const { showDialog } = useDialog();
    const { showSurface } = useSurface();
    const {
        KeyboardShortcutsDialog,
        ExportDialog,
        Commands,
    } = useEditorComponents();

    const actions = React.useMemo<ActionItem[]>(() => {
        const defaultActions = Object.values({
            [ACTIONS.OPEN]: {
                id: ACTIONS.OPEN,
                onSelect: () => {
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
                    if (editor.pages.length === 1 && editor.getElements().length === 0) {
                        return openFile();
                    }
                    // If is not empty, display confirmation
                    showConfirm({
                        title: "Load new drawing",
                        message: "Changes made in this drawing will be lost. Do you want to continue?",
                        callback: () => openFile(),
                    });
                },
            },
            [ACTIONS.SAVE]: {
                id: ACTIONS.SAVE,
                onSelect: () => {
                    saveAsJson(editor.toJSON())
                        .then(() => console.log("Folio file saved"))
                        .catch(error => console.error(error));
                },
            },
            [ACTIONS.CLEAR]: {
                id: ACTIONS.CLEAR,
                name: "Clear board",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    showConfirm({
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
            },
            [ACTIONS.UNDO]: {
                id: ACTIONS.UNDO,
                name: "Undo",
                icon: "history-undo",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    editor.undo();
                    editor.dispatchChange();
                    editor.update();
                },
            },
            [ACTIONS.REDO]: {
                id: ACTIONS.REDO,
                name: "Redo",
                icon: "history-redo",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    editor.redo();
                    editor.dispatchChange();
                    editor.update();
                },
            },
            [ACTIONS.ZOOM_IN]: {
                id: ACTIONS.ZOOM_IN,
                name: "Zoom in",
                icon: "zoom-in",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    editor.setZoom(editor.getZoom() + ZOOM_STEP);
                    editor.update();
                },
            },
            [ACTIONS.ZOOM_OUT]: {
                id: ACTIONS.ZOOM_OUT,
                name: "Zoom out",
                icon: "zoom-out",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    editor.setZoom(editor.getZoom() - ZOOM_STEP);
                    editor.update();
                },
            },
            [ACTIONS.ZOOM_RESET]: {
                id: ACTIONS.ZOOM_RESET,
                name: "Reset zoom",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    editor.resetZoom();
                    editor.update();
                },
            },
            [ACTIONS.ZOOM_FIT]: {
                id: ACTIONS.ZOOM_FIT,
                name: "Fit zoom to visible elements in board",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    editor.fitZoomToSelection();
                    editor.update();
                },
            },
            [ACTIONS.ZOOM_FIT_SELECTION]: {
                id: ACTIONS.ZOOM_FIT_SELECTION,
                name: "Fit zoom to current selection",
                category: ActionCategory.BOARD_ACTIONS,
                onSelect: () => {
                    editor.fitZoomToSelection(editor.getSelection());
                    editor.update();
                },
            },
            [ACTIONS.SELECT_ALL]: {
                id: ACTIONS.SELECT_ALL,
                name: "Select all",
                icon: "box-selection",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    editor.getElements().forEach((el: any) => {
                        el.selected = true;
                    });
                    editor.update();
                },
            },
            [ACTIONS.DELETE_SELECTION]: {
                id: ACTIONS.DELETE_SELECTION,
                name: "Delete selection",
                icon: "trash",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.removeElements(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.DUPLICATE_SELECTION]: {
                id: ACTIONS.DUPLICATE_SELECTION,
                name: "Duplicate selection",
                icon: "copy",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.duplicateElements(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.LOCK_SELECTION]: {
                id: ACTIONS.LOCK_SELECTION,
                name: "Lock selection",
                icon: "lock",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.lockElements(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.UNLOCK_SELECTION]: {
                id: ACTIONS.UNLOCK_SELECTION,
                name: "Unlock selection",
                icon: "unlock",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.unlockElements(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.GROUP_SELECTION]: {
                id: ACTIONS.GROUP_SELECTION,
                name: "Group selection",
                icon: "object-group",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 1) {
                        editor.groupElements(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.UNGROUP_SELECTION]: {
                id: ACTIONS.UNGROUP_SELECTION,
                name: "Ungroup selection",
                icon: "object-ungroup",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.ungroupElements(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.BRING_FORWARD]: {
                id: ACTIONS.BRING_FORWARD,
                name: "Bring forward",
                icon: "bring-forward",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.bringElementsForward(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.BRING_TO_FRONT]: {
                id: ACTIONS.BRING_TO_FRONT,
                name: "Bring to front",
                icon: "bring-to-front",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.bringElementsToFront(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.SEND_BACKWARD]: {
                id: ACTIONS.SEND_BACKWARD,
                name: "Send backward",
                icon: "send-backward",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.sendElementsBackward(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.SEND_TO_BACK]: {
                id: ACTIONS.SEND_TO_BACK,
                name: "Send to back",
                icon: "send-to-back",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.sendElementsToBack(selectedElements);
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.ADD_SELECTION_TO_LIBRARY]: {
                id: ACTIONS.ADD_SELECTION_TO_LIBRARY,
                name: "Add selection to library",
                onSelect: () => {
                    const collections = library?.getCollections() || [];
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        prompt({
                            title: "Add Component",
                            confirmText: "Save",
                            cancelText: "Cancel",
                            className: "max-w-sm w-full",
                            initialData: {
                                collection: "",
                            },
                            items: getLibraryComponentFields(collections),
                            callback: (data = {}) => {
                                library?.addComponent(selectedElements, data);
                                editor.update();
                            },
                        });
                    }
                },
            },
            [ACTIONS.INSERT_LIBRARY_COMPONENT]: {
                id: ACTIONS.INSERT_LIBRARY_COMPONENT,
                name: "Insert library component",
                onSelect: (component: any) => {
                    // Note: we avoid to inster the component if the page is in readonly mode
                    if (!editor.page.readonly) {
                        editor.setCurrentTool(TOOLS.SELECT);
                        editor.importElements(component.elements, null, null, uid(20));
                        editor.dispatchChange();
                        editor.update();
                    }
                },
            },
            [ACTIONS.EDIT_LIBRARY_COMPONENT]: {
                id: ACTIONS.EDIT_LIBRARY_COMPONENT,
                name: "Edit library component",
                onSelect: (component: any) => {
                    const collections = library?.getCollections() || [];
                    prompt({
                        title: "Edit Component",
                        confirmText: "Save",
                        cancelText: "Cancel",
                        className: "max-w-sm w-full",
                        initialData: {
                            ...component,
                        },
                        items: getLibraryComponentFields(collections),
                        callback: (data = {}) => {
                            library?.updateComponent(component.id, data);
                            editor.update();
                        },
                    });
                },
            },
            [ACTIONS.DELETE_LIBRARY_COMPONENT]: {
                id: ACTIONS.DELETE_LIBRARY_COMPONENT,
                name: "Delete library component",
                onSelect: (component: any) => {
                    showConfirm({
                        title: "Delete library item",
                        message: `Do you want to delete this item from the library? This action can not be undone.`,
                        callback: () => {
                            library?.removeComponent(component.id);
                            editor.update();
                        },
                    });
                },
            },
            [ACTIONS.CLEAR_LIBRARY]: {
                id: ACTIONS.CLEAR_LIBRARY,
                name: "Delete library",
                onSelect: () => {
                    showConfirm({
                        title: "Delete library",
                        message: `Do you want to delete your library? This action can not be undone.`,
                        callback: () => {
                            library?.clear();
                            editor.update();
                        },
                    });
                },
            },
            [ACTIONS.EXPORT_LIBRARY]: {
                id: ACTIONS.EXPORT_LIBRARY,
                name: "Export library",
                onSelect: () => {
                    if (library) {
                        const libraryData = library.export();
                        saveLibraryAsJson(libraryData).then(() => {
                            console.log("library exported");
                        });
                    }
                },
            },
            [ACTIONS.LOAD_LIBRARY]: {
                id: ACTIONS.LOAD_LIBRARY,
                name: "Load library",
                onSelect: () => {
                    loadLibraryFromJson().then(libraryData => {
                        library?.load(libraryData);
                        editor.update();
                    });
                },
            },
            [ACTIONS.ADD_LIBRARY_COLLECTION]: {
                id: ACTIONS.ADD_LIBRARY_COLLECTION,
                name: "Add collection",
                onSelect: () => {
                    prompt({
                        title: "Create Collection",
                        confirmText: "Save",
                        cancelText: "Cancel",
                        className: "max-w-sm w-full",
                        initialData: {},
                        items: {
                            name: {
                                type: FORM_OPTIONS.TEXT,
                                title: "Collection name",
                            },
                            description: {
                                type: FORM_OPTIONS.TEXTAREA,
                                title: "Short description of the collection",
                            },
                        },
                        callback: (data = {}) => {
                            library?.addCollection(data);
                            editor.update();
                        },
                    });
                },
            },
            [ACTIONS.EDIT_LIBRARY_COLLECTION]: {
                id: ACTIONS.EDIT_LIBRARY_COLLECTION,
                name: "Edit collection",
                onSelect: (collection: any) => {
                    prompt({
                        title: "Edit Collection",
                        confirmText: "Save",
                        cancelText: "Cancel",
                        className: "max-w-sm w-full",
                        initialData: {
                            ...collection,
                        },
                        items: {
                            name: {
                                type: FORM_OPTIONS.TEXT,
                                title: "Collection name",
                            },
                            description: {
                                type: FORM_OPTIONS.TEXTAREA,
                                title: "Short description of the collection",
                            },
                        },
                        callback: (data = {}) => {
                            library?.updateCollection(collection.id, data);
                            editor.update();
                        },
                    });
                },
            },
            [ACTIONS.EXPORT_LIBRARY_COLLECTION]: {
                id: ACTIONS.EXPORT_LIBRARY_COLLECTION,
                name: "Export collection",
                onSelect: (collection: any) => {
                    if (library) {
                        const libraryData = library.exportCollection(collection.id);
                        saveLibraryAsJson(libraryData).then(() => {
                            console.log("library exported");
                        });
                    }
                },
            },
            [ACTIONS.DELETE_LIBRARY_COLLECTION]: {
                id: ACTIONS.DELETE_LIBRARY_COLLECTION,
                name: "Delete collection",
                onSelect: (collection: any) => {
                    showConfirm({
                        title: "Delete collection",
                        message: `Do you want to delete the collection ${collection.name}?`,
                        confirmText: "Yes, delete collection",
                        // cancelText: ""
                        callback: () => {
                            library?.removeCollection(collection.id);
                            editor.update();
                        },
                    });
                },
            },
            [ACTIONS.CUT]: {
                id: ACTIONS.CUT,
                name: "Cut",
                icon: "cut",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.cutElementsToClipboard(selectedElements).then(() => {
                            editor.dispatchChange();
                            editor.update();
                        });
                    }
                },
            },
            [ACTIONS.COPY]: {
                id: ACTIONS.COPY,
                name: "Copy",
                icon: "copy",
                category: ActionCategory.EDITION,
                onSelect: () => {
                    const selectedElements = editor.getSelection();
                    if (selectedElements.length > 0) {
                        editor.copyElementsToClipboard(selectedElements).then(() => {
                            editor.dispatchChange();
                            editor.update();
                        });
                    }
                },
            },
            [ACTIONS.PASTE]: {
                id: ACTIONS.PASTE,
                name: "Paste",
                icon: "paste",
                category: ActionCategory.EDITION,
                onSelect: ({ event = null, position = null }) => {
                    editor.pasteElementsFromClipboard(event, position).then(() => {
                        editor.dispatchChange();
                        editor.update();
                    });
                },
            },
            [ACTIONS.CREATE_PAGE]: {
                id: ACTIONS.CREATE_PAGE,
                name: "Create page",
                onSelect: () => {
                    editor.addPage({});
                    editor.dispatchChange();
                    editor.update();
                },
            },
            [ACTIONS.EDIT_PAGE]: {
                id: ACTIONS.EDIT_PAGE,
                name: "Edit page",
                onSelect: (page = null) => {
                    if (page?.id) {
                        prompt({
                            title: "Edit Page",
                            confirmText: "Save Changes",
                            cancelText: "Cancel",
                            className: "max-w-sm w-full",
                            initialData: {
                                ...page,
                            },
                            items: {
                                title: {
                                    type: FORM_OPTIONS.TEXT,
                                    title: "Name",
                                    placeholder: "Untitled Page",
                                    helper: "Give your page a name.",
                                },
                                description: {
                                    type: FORM_OPTIONS.TEXTAREA,
                                    title: "Description",
                                    helper: "Add a description to your page.",
                                },
                                readonly: {
                                    type: FORM_OPTIONS.CHECKBOX,
                                    title: "Read-Only",
                                    helper: "Prevent performing changes to the page.",
                                },
                            },
                            callback: (data = {}) => {
                                // currently the only way to update page properties is using 
                                // object.assign to the page object
                                Object.assign(page, data);
                                editor.dispatchChange();
                                editor.update();
                            },
                        });
                    }
                },
            },
            [ACTIONS.DELETE_PAGE]: {
                id: ACTIONS.DELETE_PAGE,
                name: "Delete page",
                onSelect: (page = null) => {
                    const pageToDelete = page || editor.page; // if no page is provided, use the current page
                    showConfirm({
                        title: "Delete page",
                        message: `Do you want to delete '${pageToDelete.title}'? This action can not be undone.`,
                        callback: () => {
                            editor.removePage(pageToDelete);
                            editor.dispatchChange();
                            editor.update();
                        },
                    });
                },
            },
            [ACTIONS.DUPLICATE_PAGE]: {
                id: ACTIONS.DUPLICATE_PAGE,
                name: "Duplicate page",
                onSelect: (page = null) => {
                    const pageToDuplicate = page || editor.page; // if no page is provided, use the current page
                    editor.duplicatePage(pageToDuplicate);
                    editor.dispatchChange();
                    editor.update();
                },
            },
            [ACTIONS.CLEAR_PAGE]: {
                id: ACTIONS.CLEAR_PAGE,
                name: "Clear page",
                onSelect: (page = null) => {
                    const pageToClear = page || editor.page; // if no page is provided, use the current page
                    showConfirm({
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
            },
            [ACTIONS.NEXT_PAGE]: {
                id: ACTIONS.NEXT_PAGE,
                name: "Next page",
                onSelect: () => {
                    const currentPageIndex = editor.pages.findIndex((page: any) => page.id === editor.page.id);
                    if (currentPageIndex < editor.pages.length - 1) {
                        editor.setActivePage(editor.pages[currentPageIndex + 1]);
                        editor.update();
                    }
                },
            },
            [ACTIONS.PREVIOUS_PAGE]: {
                id: ACTIONS.PREVIOUS_PAGE,
                name: "Previous page",
                onSelect: () => {
                    const currentPageIndex = editor.pages.findIndex((page: any) => page.id === editor.page.id);
                    if (currentPageIndex > 0) {
                        editor.setActivePage(editor.pages[currentPageIndex - 1]);
                        editor.update();
                    }
                },
            },
            [ACTIONS.TOGGLE_GRID]: {
                id: ACTIONS.TOGGLE_GRID,
                name: "Toggle grid",
                icon: "grid",
                category: ActionCategory.SETTINGS,
                onSelect: () => {
                    editor.appState.grid = !editor.appState?.grid;
                    editor.dispatchChange();
                    editor.update();
                },
            },
            [ACTIONS.TOGGLE_SNAP_TO_ELEMENTS]: {
                id: ACTIONS.TOGGLE_SNAP_TO_ELEMENTS,
                name: "Toggle snap to elements",
                icon: "magnet",
                category: ActionCategory.SETTINGS,
                onSelect: () => {
                    editor.appState.snapToElements = !editor.appState?.snapToElements;
                    editor.dispatchChange();
                    editor.update();
                },
            },
            [ACTIONS.TOGGLE_SHOW_DIMENSIONS]: {
                id: ACTIONS.TOGGLE_SHOW_DIMENSIONS,
                name: "Toggle show dimensions",
                icon: "ruler",
                category: ActionCategory.SETTINGS,
                onSelect: () => {
                    editor.appState.objectDimensions = !editor.appState?.objectDimensions;
                    editor.dispatchChange();
                    editor.update();
                },
            },
            [ACTIONS.SHOW_KEYBOARD_SHORTCUTS_DIALOG]: {
                id: ACTIONS.SHOW_KEYBOARD_SHORTCUTS_DIALOG,
                name: "Keyboard shortcuts",
                onSelect: () => {
                    showDialog({
                        dialogClassName: "w-full max-w-xl",
                        component: KeyboardShortcutsDialog,
                    });
                },
            },
            [ACTIONS.SHOW_EXPORT_DIALOG]: {
                id: ACTIONS.SHOW_EXPORT_DIALOG,
                name: "Export",
                onSelect: (exportOptions: any) => {
                    showDialog({
                        dialogClassName: "w-full max-w-md",
                        component: ExportDialog,
                        props: exportOptions,
                    });
                },
            },
            [ACTIONS.SHOW_COMMANDS]: {
                id: ACTIONS.SHOW_COMMANDS,
                name: "Commands",
                onSelect: () => {
                    showSurface("commands", () => (
                        <Commands />
                    ));
                },
            },
        }) as ActionItem[];
        // 1. check if the props.overrides is a function
        if (typeof props.overrides === "function") {
            return props.overrides(editor, defaultActions);
        }
        // 2. check if the props.overrides is an array
        if (!!props.overrides && Array.isArray(props.overrides)) {
            return props.overrides;
        }
        // 3. return the default actions
        return defaultActions;
    }, [editor, props.overrides]);

    // create a map to quickly access an action by its id
    const actionsMap = React.useMemo(() => {
        return new Map(actions.map(action => [action.id, action]));
    }, [actions]);

    // method to dispatch an action
    const dispatchAction = React.useCallback((actionId: string, payload: any) => {
        const action = actionsMap.get(actionId);
        if (action) {
            action.onSelect(payload);
        }
    }, [actionsMap]);

    // get all actions
    const getActions = React.useCallback(() => actions, [actions]);

    // get action by id
    const getActionById = React.useCallback((actionId: string) => {
        return actionsMap.get(actionId) || null;
    }, [actionsMap]);

    // get action by shortcut
    const getActionByShortcut = React.useCallback((shortcut: string) => {
        return actions.find(action => action.shortcut === shortcut) || null;
    }, [actions]);

    // build the actions manager
    const actionsManager = React.useMemo<ActionsManager>(() => {
        return {
            dispatchAction,
            getActions,
            getActionById,
            getActionByShortcut,
        };
    }, [dispatchAction, getActions, getActionById, getActionByShortcut]);

    // return the actions provider
    return (
        <ActionsContext.Provider value={actionsManager}>
            {props.children}
        </ActionsContext.Provider>
    );
};
