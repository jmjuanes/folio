import {ELEMENT_CHANGES} from "./constants.js";
import {getElementSvg} from "./elements/index.jsx";
import {generateID} from "./utils/index.js";

export const createApp = () => {
    const app = {
        readOnly: false,
        activeElement: null,
        activeGroup: null,
        elements: [],
        style: {},
        clear: () => {
            app.elements = [];
            app.activeElement = null;
            app.activeGroup = null;
            app.clearHistory();
        },
        load: elements => {
            app.clear();
            app.elements = elements.map(element => ({
                ...element,
                selected: false,
            }));
        },
        addElement: el => app.elements.push(el),
        createElement: type => {
            const newElement = {
                type: type,
                id: generateID(),
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                selected: false,
                editing: false,
                locked: false,
                group: null,
                resizeHandlers: false,
                nodeHandlers: false,
                ...app.style,
            };
            app.addElement(newElement);
            return newElement;
        },
        removeElement: el => app.elements = app.elements.filter(element => el.id !== element.id),
        getElements: () => app.elements,
        getElement: id => app.elements.find(el => el.id === id),

        // Selection API
        getSelectedElements: () => app.elements.filter(el => !!el.selected),
        clearSelectedElements: () => app.elements.forEach(el => el.selected = false),
        removeSelectedElements: () => app.elements = app.elements.filter(el => !el.selected),
        exportSelectedElements: () => {
            return app.getSelectedElements().map(el => ({
                ...el,
                selected: false,
            }));
        },
        setSelectedElements: region => {
            // TODO
        },
        snapshotSelectedElements: () => app.getSelectedElements().map(el => ({...el})),
        updateSelectedElements: (key, value) => {
            app.getSelectedElements().forEach(element => {
                element[key] = value;
            });
        },
        cloneSelectedElements: null,
        cutSelectedElements: () => null,
        copySelectedElements: () => app.getSelectedElements().reverse(),

        pasteElements: elements => {
            app.clearSelectedElements();
            if (elements?.length > 0) {
                // const groupsMap = new Map();
                elements.forEach(element => {
                    // if (elements.length > 1 && el.group && !groupsMap.has(el.group)) {
                    //     groupsMap.set(el.group, generateID());
                    // }
                    app.addElement({
                        ...element,
                        id: generateID(),
                        selected: true,
                        //group: app.activeGroup || groupsMap.get(el.group) || null,
                    });
                });
                app.addHistoryEntry({
                    type: ELEMENT_CHANGES.CREATE,
                    elements: elements.map(el => ({
                        id: el.id,
                        prevValues: null,
                        newValues: {...el},
                    })),
                });
            }
        },

        // Board groups API
        getElementsInGroup: group => {
            return app.elements.filter(el => el.group && el.group === group);
        },
        getElementsInActiveGroup: () => {
            return app.activeGroup ? app.getElementsInGroup(app.activeGroup) : [];
        },
         
        //
        // History API
        //

        history: [],
        historyIndex: 0,
        clearHistory: () => {
            app.history = [];
            app.historyIndex = 0;
        },
        addHistoryEntry: entry => {
            if (app.historyIndex > 0) {
                app.history = app.history.slice(app.historyIndex);
                app.historyIndex = 0;
            }
            // Check for updating the same elements and the same keys
            if (entry.keys && entry.ids && app.history.length > 0) {
                const last = app.history[0];
                if (last.ids === entry.ids && last.keys === entry.keys) {
                    const keys = entry.keys.split(",");
                    last.elements.forEach((element, index) => {
                        element.newValues = Object.fromEntries(keys.map(key => {
                            return [key, entry.elements[index].newValues[key]];
                        }));
                    });
                    return;
                }
            }
            // Register the new history entry
            app.history.unshift(entry);
        },
        registerSelectionUpdate: (keys, values, groupChanges) => {
            const selectedElements = app.getSelectedElements();
            app.addHistoryEntry({
                type: ELEMENT_CHANGES.UPDATE,
                ids: groupChanges && selectedElements.map(el => el.id).join(","),
                keys: groupChanges && keys.join(","),
                elements: selectedElements.map(element => ({
                    id: element.id,
                    prevValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                    newValues: Object.fromEntries(keys.map((key, index) => [key, values[index]])),
                })),
            });
        },
        registerSelectionRemove: () => {
            return app.addHistoryEntry({
                type: ELEMENT_CHANGES.REMOVE,
                elements: app.getSelectedElements().map(element => ({
                    id: element.id,
                    prevValues: {...element},
                    newValues: null,
                })),
            });
        },
        registerElementCreate: element => {
            return app.addHistoryEntry({
                type: ELEMENT_CHANGES.CREATE,
                elements: [{
                    id: element.id,
                    prevValues: null,
                    newValues: {...element},
                }],
            });
        },
        registerElementRemove: element => {
            return app.addHistoryEntry({
                type: ELEMENT_CHANGES.REMOVE,
                elements: [{
                    id: element.id,
                    prevValues: {...element},
                    newValues: null,
                }],
            });
        },
        undo: () => {
            if (app.historyIndex < app.history.length) {
                const entry = app.history[app.historyIndex];
                if (entry.type === ELEMENT_CHANGES.CREATE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = app.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGES.REMOVE) {
                    entry.elements.forEach(el => app.elements.unshift({...el.prevValues}));
                } else if (entry.type === ELEMENT_CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(app.elements.find(el => el.id === element.id), element.prevValues);
                    });
                }
                app.historyIndex = app.historyIndex + 1;
                app.activeGroup = null;
                app.elements.forEach(el => el.selected = false);
            }
        },
        redo: () => {
            if (app.historyIndex > 0 && app.history.length > 0) {
                app.historyIndex = app.historyIndex - 1;
                const entry = app.history[app.historyIndex];
                if (entry.type === ELEMENT_CHANGES.CREATE) {
                    entry.elements.forEach(el => app.elements.unshift({...el.newValues}));
                } else if (entry.type === ELEMENT_CHANGES.REMOVE) {
                    const removeElements = new Set(entry.elements.map(el => el.id));
                    app.elements = app.elements.filter(el => !removeElements.has(el.id));
                } else if (entry.type === ELEMENT_CHANGES.UPDATE) {
                    entry.elements.forEach(element => {
                        Object.assign(app.elements.find(el => el.id === element.id) || {}, element.newValues);
                    });
                }
                app.activeGroup = null;
                app.elements.forEach(el => el.selected = false);
            }
        },
        isUndoDisabled: () => app.historyIndex >= app.history.length,
        isRedoDisabled: () => app.historyIndex === 0 || app.history.length < 1,

        // Cut / Copy / Paste actions
        // cut: () => {
        //     // First copy all items and then remove selection
        //     return app.copy().then(() => {
        //         if (!app.isReadOnly) {
        //             app.removeSelectedElements();
        //             app.registerSelectionRemove();
        //         }
        //     });
        // },
        // copy: () => {
        //     const elements = board.current.copySelectedElements();
        //     const data = `folio:::${JSON.stringify(elements)}`;
        //     if (window?.navigator?.clipboard) {
        //         return navigator.clipboard.writeText(data);
        //     }
        //     // If clipboard is not available
        //     return Promise.reject(new Error("Clipboard not available"));
        // },
        // paste: event => {
        //     if (app.isReadOnly) {
        //         return Promise.reject(new Error("Board is read-only"));
        //     }
        //     app.clearSelectedElements();
        //     // app.activeGroup = null;
        //     return getDataFromClipboard(event).then(data => {
        //         if (data?.type === "text" && data?.content?.startsWith("folio:::")) {
        //             const elements = JSON.parse(data.content.split("folio:::")[1].trim());
        //             // elements.forEach(el => {
        //             //     el.x = el.x + index * (state.gridEnabled ? state.gridSize : 10);
        //             //     el.y = el.y + index * (state.gridEnabled ? state.gridSize : 10);
        //             // });
        //             app.pasteElements(elements || []);
        //             return true;
        //         }
        //     });
        // },

        //
        // Export API
        //

        export: () => {
            return app.elements.map(el => ({
                ...el,
                selected: false,
            }));
        },
        exportImage: () => {
            return null;
        },
        exportJson: () => {
            return app.export();
        },
    };
    return app;
};
