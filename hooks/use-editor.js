import React from "react";
import {useUpdate} from "react-use";
import {STATES, PASTE_OFFSET, ZOOM_STEP} from "@lib/constants.js";
import {createScene, sceneActions} from "@lib/scene.js";
import {
    parseZoomValue,
    getTranslateCoordinatesForNewZoom,
} from "@lib/zoom.js";
import {
    getTextFromClipboard,
    copyTextToClipboard,
    getTextFromClipboardItem,
    getBlobFromClipboardItem,
} from "@lib/utils/clipboard.js";

// Tiny function to parse text data
const parseTextDataToScene = (scene, content, x, y) => {
    if (typeof content === "string") {
        if (content?.startsWith("folio:::")) {
            const data = JSON.parse(content.split("folio:::")[1].trim());
            // We need to register the provided assets in the new assets object
            // To prevent different assets ids, we will use a map to convert provided
            // assets Ids to new assets ids
            const assetMap = {};
            Object.values(data?.assets || {}).forEach(asset => {
                if (asset && asset.id && asset.dataUrl) {
                    assetMap[asset.id] = sceneActions.addAsset(scene, asset.dataUrl, asset.type);
                }
            });
            // Paste provided elements
            const elements = (data?.elements || []).map(originalElement => {
                const element = {...originalElement};
                if (!!element.assetId && !!assetMap[element.assetId]) {
                    element.assetId = assetMap[element.assetId];
                }
                return element;
            });
            const bounds = getRectangleBounds(data?.elements || []);
            const dx = point ? x - bounds.x1 : 0;
            const dy = point ? y - bounds.y1 : 0;
            sceneActions.importElements(scene, elements, dx, dy);
            // update();
            return Promise.resolve(true);
        }
        // Create a new text element
        return sceneActions.addTextElement(scene, content, x, y);
    }
    // No valid text, reject promise
    return Promise.reject(null);
};

// Set zoom
const setZoom = (editor, value) => {
    const zoom = parseZoomValue(value);
    const {translateX, translateY} = getTranslateCoordinatesForNewZoom(zoom, editor.scene);
    Object.assign(editor.scene, {zoom, translateX, translateY});
    editor.state.contextMenu = false;
    editor.update();
};

export const useEditor = ({initialData, onChange}) => {
    const update = useUpdate();
    const editorRef = React.useRef(null);

    // Initialize editor
    if (!editorRef.current) {
        const state = {
            current: STATES.IDLE,
            action: null,
            tool: null,
            toolLocked: false,
            grid: false,
            presentation: false,
            selection: null,
            erase: null,
            contextMenu: false,
            contextMenuTop: 0,
            contextMenuLeft: 0,
        };
        const editor = {
            update: update,
            scene: createScene(initialData),
            state: state,

            // @description dispatch change event
            dispatchChange: () => {
                onChange({
                    elements: editor.scene.elements,
                    assets: editor.scene.assets,
                });
                update();
            },

            // @description set active tool
            setTool: newTool => {
                editor.setAction(null);
                sceneActions.clearSelection(editor.scene);
                editor.state.tool = newTool;
            },

            // @description set active action
            setAction: newAction => {
                editor.scene.elements.forEach(el => el.editing = false);
                editor.state.action = newAction;
                editor.state.contextMenu = false;
            },

            // @description Copy current selection to clipboard
            copy: () => {
                const elements = sceneActions.getSelection(editor.scene);
                if (elements.length > 0) {
                    const data = sceneActions.export(editor.scene, elements);  
                    return copyTextToClipboard(`folio:::${JSON.stringify(data)}`);
                }
                return Promise.resolve(null);
            },

            // @description Copy current selection to clipboard and remove selection
            cut: () => {
                return editor.copy().then(() => {
                    sceneActions.removeSelection(editor.scene);
                    editor.dispatchChange();
                });
            },

            // @description Get data from clipboard and add it to the scene
            paste: (event, point) => {
                const x = point ? (point.x - editor.scene.translateX) / editor.scene.zoom : null;
                const y = point ? (point.y - editor.scene.translateY) / editor.scene.zoom : null;
                // Check for paste event
                if (event?.clipboardData) {
                    const clipboardItems = event.clipboardData?.items || [];
                    for (let i = 0; i < clipboardItems.length; i++) {
                        const item = clipboardItems[i];
                        // Check for image data (image/png, image/jpg)
                        if (item.type.startsWith("image/")) {
                            return getBlobFromClipboardItem(item)
                                .then(content => sceneActions.addImageElement(editor.scene, content, x, y))
                                .then(() => {
                                    editor.state.contextMenu = false;
                                    editor.dispatchChange();
                                });
                        }
                        // Check for text data
                        else if (item.type === "text/plain") {
                            return getTextFromClipboardItem(item)
                                .then(content => parseTextDataToScene(editor.scene, content, x, y))
                                .then(() => {
                                    editor.state.contextMenu = false;
                                    editor.dispatchChange();
                                });
                        }
                    }
                }
                // If not, check clipboard
                return getTextFromClipboard()
                    .then(content => parseTextDataToScene(editor.scene, content, x, y))
                    .then(() => {
                        editor.state.contextMenu = false;
                        editor.dispatchChange();
                    });
            },

            // @description remove selected elements
            remove: () => {
                const elements = sceneActions.getSelection(editor.scene);
                if (elements && elements.length > 0) {
                    sceneActions.removeElements(editor.scene, elements);
                }
                editor.state.contextMenu = false;
                editor.dispatchChange();
            },

            // @description duplicate current selected elements
            duplicate: () => {
                const elements = sceneActions.getSelection(editor.scene);
                if (elements && elements.length > 0) {
                    const bounds = getRectangleBounds(elements);
                    const dx = (bounds.x2 + PASTE_OFFSET) - bounds.x1;
                    sceneActions.importElements(editor.scene, elements, dx, 0);
                    // onChange?.({
                    //     elements: editor.scene.elements,
                    // });
                }
                // Hide context menu if enabled and update editor
                editor.state.contextMenu = false;
                editor.dispatchChange();
            },

            // @description lock current selection
            lockElements: () => {
                const elements = sceneActions.getSelection(editor.scene);
                if (elements && elements.length > 0) {
                    sceneActions.lockElements(editor.scene, elements);
                }
                editor.dispatchChange();
            },

            // @description unlock selected elements
            unlockElements: () => {
                const elements = sceneActions.getSelection(editor.scene);
                if (elements && elements.length > 0) {
                    sceneActions.unlockElements(editor.scene, elements);
                }
                editor.dispatchChange();
            },

            // @description send selection backward
            sendBackward: () => {
                const elements = sceneActions.getSelection(editor.scene);
                if (elements && elements.length > 0) {
                    sceneActions.sendElementsBackward(editor.scene, elements);
                }
                editor.state.contextMenu = false;
                editor.dispatchChange();
            },

            // @description bring selection forward
            bringForward: () => {
                const elements = sceneActions.getSelection(editor.scene);
                if (elements && elements.length > 0) {
                    sceneActions.bringElementsForward(editor.scene, elements);
                }
                editor.state.contextMenu = false;
                editor.dispatchChange();
            },

            // @description Select all visible elements
            selectAll: () => {
                editor.scene.elements.forEach(element => element.selected = true);
                editor.state.contextMenu = false;
                update();
            },

            // @description Remove selection
            selectNone: () => {
                editor.scene.elements.forEach(element => element.selected = false);
                editor.state.contextMenu = false;
                update();
            },

            // @description undo latest changes
            undo: () => {
                sceneActions.undoHistory(editor.scene);
                editor.dispatchChange();
            },

            // @description redo latest changes
            redo: () => {
                sceneActions.redoHistory(editor.scene);
                editor.dispatchChange();
            },

            // @description zoom in
            zoomIn: () => {
                return setZoom(editor, editor.scene.zoom + ZOOM_STEP);
            },

            // @description zoom out
            zoomOut: () => {
                return setZoom(editor, editor.scene.zoom - ZOOM_STEP);
            },
        };
        // Save the reference to the editor
        editorRef.current = editor;
    }
    return editorRef.current;
};
