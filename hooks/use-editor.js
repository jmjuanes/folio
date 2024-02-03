import React from "react";
import {useUpdate} from "react-use";
import {STATES, PASTE_OFFSET} from "@lib/constants.js";
import {sceneActions} from "@lib/scene.js";
import {
    getTextFromClipboard,
    copyTextToClipboard,
    getTextFromClipboardItem,
    getBlobFromClipboardItem,
} from "@lib/utils/clipboard.js";

export const useEditor = (scene) => {
    const update = useUpdate();
    const editorActions = React.useRef(null);
    const editorState = React.useRef({
        current: STATES.IDLE,
        action: null,
        tool: null,
        toolLock: false,
        grid: false,
        presentation: false,
        selection: null,
        erase: null,
        contextMenu: false,
    });

    // Initialize editor actions
    if (!editorActions.current) {
        editorActions.current = {
            setTool: newTool => {
                editorActions.current.setAction(null);
                sceneActions.clearSelector(scene);
                editorState.current.tool = newTool;
            },
            setAction: newAction => {
                scene.elements.forEach(el => el.editing = false);
                editorState.current.action = newAction;
                editorState.current.contextMenu = false;
            },
            // Copy current selection to clipboard
            copy: () => {
                const elements = sceneActions.getSelection(scene);
                if (elements.length > 0) {
                    const data = sceneActions.export(scene, elements);  
                    return copyTextToClipboard(`folio:::${JSON.stringify(data)}`);
                }
                return Promise.resolve(null);
            },
            cut: () => {
                return editorActions.current.copy().then(() => {
                    sceneActions.removeSelection(scene);
                });
            },
            paste: (event, point) => {
                const x = point ? (point.x - scene.state.translateX) / scene.state.zoom : null;
                const y = point ? (point.y - scene.state.translateY) / scene.state.zoom : null;
                // Tiny function to parse text data
                const parseTextData = content => {
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

                // Check for paste event
                if (event?.clipboardData) {
                    const clipboardItems = event.clipboardData?.items || [];
                    for (let i = 0; i < clipboardItems.length; i++) {
                        const item = clipboardItems[i];
                        // Check for image data (image/png, image/jpg)
                        if (item.type.startsWith("image/")) {
                            return getBlobFromClipboardItem(item).then(content => {
                                return sceneActions.addImageElement(scene, content, x, y);
                            });
                        }
                        // Check for text data
                        else if (item.type === "text/plain") {
                            return getTextFromClipboardItem(item).then(content => {
                                return parseTextData(content);
                            });
                        }
                    }
                }
                // If not, check clipboard
                else {
                    return getTextFromClipboard().then(content => {
                        return parseTextData(content);
                    });
                }
                // Other case, no data to paste
                return Promise.reject(null);
            },
            duplicate: () => {
                const elements = sceneActions.getSelection(scene);
                if (elements && elements.length > 0) {
                    const bounds = getRectangleBounds(elements);
                    const dx = (bounds.x2 + PASTE_OFFSET) - bounds.x1;
                    sceneActions.importElements(scene, elements, dx, 0);
                }
            },
            selectAll() {
                scene.elements.forEach(element => element.selected = true);
                // this.activeGroup = null;
            },
            selectNone() {
                scene.elements.forEach(element => element.selected = false);
                // this.activeGroup = null;
            },
        };
    }

    return {
        state: editorState.current,
        actions: editorActions.current,
        update: update,
    };
};
