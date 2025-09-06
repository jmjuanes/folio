import React from "react";
import { useUpdate } from "react-use";
import {
    ACTIONS,
    ELEMENTS,
    HANDLERS,
    GRID_SIZE,
    IS_DARWIN,
    TOOLS,
    CHANGES,
    KEYS,
    STATUS,
    SNAP_THRESHOLD,
    SNAP_EDGE_X,
    SNAP_EDGE_Y,
    FIELDS,
} from "../constants.js";
import {
    normalizeBounds,
    getBoundingRectangle,
    clampAngle,
    snapAngle,
    rotatePoints,
} from "../utils/math.ts";
import { isArrowKey } from "../utils/keys.js";
import { isInputTarget } from "../utils/events.js";
import {
    getElementConfig, 
    createElement,
    getElementsSnappingEdges,
    getElementSnappingPoints,
    getElementsBoundingRectangle,
} from "../lib/elements.js";
import { useEditor } from "../contexts/editor.jsx";
import { useContextMenu } from "../contexts/context-menu.jsx";
import { useActions } from "./use-actions.js";
import { useTools, getToolByShortcut } from "./use-tools.js";
import { getActionByKeysCombination } from "../lib/actions.js";

// internal list with all elements
const elementsNames = new Set(Object.values(ELEMENTS));

// @private internal utility to check if the tool is an element
const isElementTool = toolName => {
    return toolName && elementsNames.has(toolName);
};

// @public use editor events listeners
export const useEvents = () => {
    const update = useUpdate();
    const { hideContextMenu } = useContextMenu();
    const editor = useEditor();
    const tools = useTools();
    const dispatchAction = useActions();

    return React.useMemo(() => {
        let snapshot = [];
        let snapshotBounds = null;
        let snapEdges = [];
        let activeSnapEdges = [];
        let activeElement = null;
        let isDragged = false, isResized = false, isPrevSelected = false;
        let lastTranslateX = 0, lastTranslateY = 0;

        // @private get position based on the grid state
        const getPosition = (pos, edge = null, size = 0, includeCenter = false) => {
            // 1. Check if grid mode is enabled
            if (editor?.appState?.grid) {
                return Math.round(pos / GRID_SIZE) * GRID_SIZE;
            }
            // 2. check if snap mode is enabled
            if (edge && editor?.appState?.snapToElements) {
                const edges = size > 0 ? (includeCenter ? [0, size / 2, size] : [0, size]) : [0];
                for (let i = 0; i < snapEdges.length; i++) {
                    const item = snapEdges[i];
                    if (item.edge === edge && typeof item[edge] !== "undefined") {
                        for (let j = 0; j < edges.length; j++) {
                            if (Math.abs(item[edge] - pos - edges[j]) < SNAP_THRESHOLD) {
                                activeSnapEdges.push(item);
                                return item[edge] - edges[j];
                            }
                        }
                    }
                }
            }
            // 3: just return the new position
            return pos;
        };

        // @description remove the current text element
        const removeTextElement = element => {
            // Check if this element has been just created
            // Just remove this history entry
            const history = editor.getHistory();
            if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
                history.shift();
            }
            editor.removeElements([element]);
            editor.dispatchChange();
            update();
        };

        // @description listen for point on canvas event
        const onPointCanvas = () => {
            editor.state.snapEdges = [];
            // if (action === ACTIONS.EDIT) {
            if (activeElement) {
                if (activeElement?.editing) {
                    if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                        removeTextElement(activeElement);
                    }
                }
                activeElement.editing = false; // Disable editing
                activeElement = null;
            }
            // Check if we have an active group
            if (editor.page.activeGroup) {
                editor.page.activeGroup = null;
                update();
            }
            if (editor.state.tool === TOOLS.SELECT) {
                editor.clearSelection();
                update();
            }
        };

        // @description listen for poin on element event
        // @param {object} event
        // @param {string} event.element identifier of the the element where the user has clicked
        // @param {boolean} event.shiftKey true if the shift key is pressed
        const onPointElement = event => {
            // if (editor.state.tool === TOOLS.SELECT && !action) {
            if (editor.state.tool === TOOLS.SELECT) {
                const element = editor.getElement(event.element);
                isPrevSelected = element.selected;
                // Check to reset active group
                if (editor.page.activeGroup && element.group !== editor.page.activeGroup) {
                    editor.getElements().forEach(el => {
                        el.selected = el.group === editor.page.activeGroup || el.selected;
                    });
                    editor.page.activeGroup = null;
                }
                const inCurrentSelection = editor.getSelection().some(el => {
                    return el.id === element.id;
                });
                if (!inCurrentSelection && !event.shiftKey) {
                    editor.clearSelection();
                }
                element.selected = true;
                if (!editor.page.activeGroup && element.group) {
                    editor.getElements().forEach(el => {
                        el.selected = el.selected || (el.group && el.group === element.group);
                    });
                }
                update();
            }
        };

        // @description listen for pointer down event
        // @param {object} event
        // @param {number} event.originalX original x position
        // @param {number} event.originalY original y position
        const onPointerDown = event => {
            isDragged = false;
            isResized = false;
            snapshot = []; // reset snapshot
            const selectedElements = editor.getSelection();
            // First we need to check if we are in a edit action
            if (activeElement?.editing) {
                if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                    removeTextElement(activeElement);
                }
                activeElement = null;
            }
            // 1. check for element tool --> set action to create
            if (isElementTool(editor.state.tool)) {
                const element = createElement(editor.state.tool);
                const elementConfig = getElementConfig(element);
                // Override element attributes
                Object.assign(element, {
                    ...(elementConfig.initialize?.(editor.defaults) || {}),
                    x1: getPosition(event.originalX),
                    y1: getPosition(event.originalY),
                    x2: getPosition(event.originalX),
                    y2: getPosition(event.originalY),
                    creating: true,
                });
                elementConfig.onCreateStart?.(element, event),
                activeElement = element; // Save element reference
                // state.activeGroup = null; // Reset current group
                editor.clearSelection();
                editor.addElements([element]);
            }
            // 2. check if tool is select and we have an active selection enabled
            else if (editor.state.tool === TOOLS.SELECT && selectedElements.length > 0) {
                if (!selectedElements.some(el => el.locked)) {
                    // make sure that action is defined
                    // action = action || ACTIONS.TRANSLATE;
                    // if (!action) {
                    //     action = ACTIONS.TRANSLATE;
                    // }
                    // Save a snapshot of the current selection for calculating the correct element position
                    snapshot = editor.getSelection().map(el => ({...el}));
                    snapshotBounds = getElementsBoundingRectangle(snapshot);
                    // Check for calling the onResizeStart listener
                    // if (action === ACTIONS.RESIZE && snapshot.length === 1) {
                    if (event.handler && snapshot.length === 1) {
                        const element = editor.getElement(snapshot[0].id);
                        const elementConfig = getElementConfig(element);
                        if (typeof elementConfig.onResizeStart === "function") {
                            elementConfig.onResizeStart(element, snapshot[0], event);
                        }
                    }
                }
            }
            // 3. we are in selection tool without selected elements
            // else if (!editor.state.action || editor.state.action === ACTIONS.SELECT || editor.state.action === ACTIONS.SCREENSHOT) {
            else if (editor.state.tool === TOOLS.SELECT && selectedElements.length === 0) {
                // editor.state.action = editor.state.action || ACTIONS.SELECT;
                editor.state.selection = {
                    x1: event.originalX,
                    y1: event.originalY,
                    x2: event.originalX,
                    y2: event.originalY,
                };
                // editor.clearSelection();
            }
            // 4. we are in drag mode
            else if (editor.state.tool === TOOLS.DRAG) {
                // action = ACTIONS.MOVE;
                // We need to update the last translated point before start moving the board
                lastTranslateX = editor.page.translateX;
                lastTranslateY = editor.page.translateY;
            }
            // 5. we are in erase tool
            // else if (editor.state.action === ACTIONS.ERASE) {
            //     editor.state.erase = {
            //         x: event.originalX,
            //         y: event.originalY,
            //     };
            // }
            editor.state.status = STATUS.POINTING;
            editor.state.snapEdges = [];
            snapEdges = [];
            activeSnapEdges = [];
            // if (action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE) {
            if (editor.state.tool === TOOLS.SELECT && selectedElements.length > 0) {
                if (editor?.appState?.snapToElements) {
                    snapEdges = getElementsSnappingEdges(editor.getElements());
                }
            }
            hideContextMenu();
            update();
        };

        // @description handle pointer move event
        // @param {object} event
        // @param {number} event.currentX current x position
        // @param {number} event.currentY current y position
        // @param {number} event.dx delta x position
        // @param {number} event.dy delta y position
        // @param {string} event.handler handler name
        const onPointerMove = event => {
            if (editor.state.tool === TOOLS.DRAG) {
                editor.state.status = STATUS.DRAGGING;
                editor.page.translateX = Math.floor(lastTranslateX + event.dx * editor.page.zoom);
                editor.page.translateY = Math.floor(lastTranslateY + event.dy * editor.page.zoom);
            }
            else if (editor.state.tool === TOOLS.ERASER) {
                editor.state.status = STATUS.ERASING;
                const x = event.originalX + event.dx;
                const y = event.originalY + event.dy;
                editor.getElements().forEach(element => {
                    if (!element.erased) {
                        const b = element.type === ELEMENTS.ARROW ? normalizeBounds(element) : element;
                        if (b.x1 <= x && x <= b.x2 && b.y1 <= y && y <= b.y2) {
                            element.erased = true;
                        }
                    }
                });
            }
            else if (isElementTool(editor.state.tool)) {
                editor.state.status = STATUS.CREATING;
                const element = activeElement;
                // First, update the second point of the element
                element.x2 = getPosition(event.currentX);
                element.y2 = getPosition(event.currentY);
                // Second, call the onCreateMove listener of the element
                getElementConfig(element)?.onCreateMove?.(element, event, getPosition);
            }
            // else if (action === ACTIONS.TRANSLATE) {
            else if (editor.state.tool === TOOLS.SELECT && snapshot.length > 0 && !event.handler) {
                editor.state.snapEdges = [];
                activeSnapEdges = [];
                editor.state.status = STATUS.TRANSLATING;
                isDragged = true;
                const elements = editor.getSelection();
                const includeCenter = elements.length > 1 || elements[0].type !== ELEMENTS.ARROW;
                const dx = getPosition(snapshotBounds[0][0] + event.dx, SNAP_EDGE_X, snapshotBounds[1][0] - snapshotBounds[0][0], includeCenter) - snapshotBounds[0][0];
                const dy = getPosition(snapshotBounds[0][1] + event.dy, SNAP_EDGE_Y, snapshotBounds[1][1] - snapshotBounds[0][1], includeCenter) - snapshotBounds[0][1];
                elements.forEach((element, index) => {
                    element.x1 = snapshot[index].x1 + dx;
                    element.x2 = snapshot[index].x2 + dx;
                    element.y1 = snapshot[index].y1 + dy;
                    element.y2 = snapshot[index].y2 + dy;
                    // Execute the onDrag function
                    getElementConfig(element)?.onDrag?.(element, snapshot[index], event);
                });
                if (editor?.appState?.snapToElements && activeSnapEdges.length > 0) {
                    let boundElement = elements[0];
                    if (elements.length > 1) {
                        const bounds = getElementsBoundingRectangle(elements);
                        boundElement = {
                            x1: bounds[0][0],
                            y1: bounds[0][1],
                            x2: bounds[1][0],
                            y2: bounds[1][1],
                        };
                    }
                    editor.state.snapEdges = activeSnapEdges.map(snapEdge => ({
                        // ...snapEdge,
                        points: [
                            ...snapEdge.points,
                            ...getElementSnappingPoints(boundElement, snapEdge),
                        ],
                    }));
                }
            }
            // else if (action === ACTIONS.RESIZE) {
            else if (editor.state.tool === TOOLS.SELECT && event.handler) {
                editor.state.snapEdges = [];
                editor.state.status = STATUS.RESIZING;
                activeSnapEdges = [];
                isResized = true;
                const element = editor.getElement(snapshot[0].id);
                const elementConfig = getElementConfig(element);
                if (event.handler === HANDLERS.ROTATION) {
                    const cx = (snapshot[0].x1 + snapshot[0].x2) / 2;
                    const cy = (snapshot[0].y1 + snapshot[0].y2) / 2;
                    const prevAngle = Math.atan2(event.originalY - cy, event.originalX - cx) + Math.PI / 2;
                    const currentAngle = Math.atan2(event.currentY - cy, event.currentX - cx) + Math.PI / 2;
                    const deltaAngle = clampAngle(event.shiftKey ? snapAngle(currentAngle - prevAngle) : currentAngle - prevAngle);
                    const angle = clampAngle((snapshot[0].rotation || 0) + deltaAngle);
                    element.rotation = angle;
                    const newPoints = rotatePoints([[snapshot[0].x1, snapshot[0].y1], [snapshot[0].x2, snapshot[0].y2]], [cx, cy], deltaAngle);
                    element.x1 = newPoints[0][0];
                    element.y1 = newPoints[0][1];
                    element.x2 = newPoints[1][0];
                    element.y2 = newPoints[1][1];
                }
                else {
                    // if (snapshot[0].rotation !== 0) {
                    //     const cos = Math.cos(-snapshot[0].rotation);
                    //     const sin = Math.sin(-snapshot[0].rotation);
                    //     const { dx, dy } = event;
                    //     event.dx = dx * cos - dy * sin;
                    //     event.dy = dx * sin + dy * cos;
                    // }
                    if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X), snapshot[0].x2);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X), snapshot[0].x1);
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X), snapshot[0].x2);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X), snapshot[0].x1);
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.EDGE_TOP) {
                        element.y1 = Math.min(getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y), snapshot[0].y2);
                    }
                    else if (event.handler === HANDLERS.EDGE_BOTTOM) {
                        element.y2 = Math.max(getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y), snapshot[0].y1);
                    }
                    else if (event.handler === HANDLERS.EDGE_LEFT) {
                        element.x1 = Math.min(getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X), snapshot[0].x2);
                    }
                    else if (event.handler === HANDLERS.EDGE_RIGHT) {
                        element.x2 = Math.max(getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X), snapshot[0].x1);
                    }
                    else if (event.handler === HANDLERS.NODE_START) {
                        element.x1 = getPosition(snapshot[0].x1 + event.dx, SNAP_EDGE_X);
                        element.y1 = getPosition(snapshot[0].y1 + event.dy, SNAP_EDGE_Y);
                    }
                    else if (event.handler === HANDLERS.NODE_END) {
                        element.x2 = getPosition(snapshot[0].x2 + event.dx, SNAP_EDGE_X);
                        element.y2 = getPosition(snapshot[0].y2 + event.dy, SNAP_EDGE_Y);
                    }
                    // Execute onResize handler
                    elementConfig?.onResize?.(element, snapshot[0], event, getPosition);
                    // Set visible snap edges
                    if (editor?.appState?.snapToElements && activeSnapEdges.length > 0) {
                        editor.state.snapEdges = activeSnapEdges.map(snapEdge => ({
                            // ...snapEdge,
                            points: [
                                ...snapEdge.points,
                                ...getElementSnappingPoints(element, snapEdge),
                            ],
                        }));
                    }
                }
            }
            // else if (editor.state.action === ACTIONS.SELECT || editor.state.action === ACTIONS.SCREENSHOT) {
            else if (editor.state.tool === TOOLS.SELECT && !!editor.state.selection) {
                editor.state.status = STATUS.BRUSHING;
                editor.state.selection.x2 = event.currentX;
                editor.state.selection.y2 = event.currentY;
            }
            // Force editor update
            update();
        };

        // @description handle pointer up event
        // @param {object} event
        const onPointerUp = event => {
            editor.state.snapEdges = [];
            editor.state.status = STATUS.IDLE;
            // if (editor.state.action === ACTIONS.MOVE) {
            if (editor.state.tool === TOOLS.DRAG) {
                lastTranslateX = editor.page.translateX;
                lastTranslateY = editor.page.translateY;
                return update();
            }
            // else if (editor.state.action === ACTIONS.ERASE) {
            else if (editor.state.tool === TOOLS.ERASER) {
                const erasedElements = editor.getErasedElements();
                editor.removeElements(erasedElements);
                editor.dispatchChange();
                return update();
            }
            // else if (editor.state.action === ACTIONS.CREATE && activeElement) {
            else if (activeElement && isElementTool(editor.state.tool)) {
                const element = activeElement;
                element.creating = false;
                element.selected = true; // By default select this element
                element[FIELDS.VERSION] = 1; // Set as initial version of this element
                getElementConfig(element)?.onCreateEnd?.(element, event);
                // We need to patch the history to save the new element values
                const last = editor.page.history[0] || {};
                if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === element.id) {
                    last.elements[0].newValues = {
                        ...element,
                        selected: false,
                    };
                }
                // Call the element created listener
                editor.dispatchChange();
                activeElement = null;
                // Check if the tool is not the handdraw
                // TODO: we need also to check if lock is enabled
                if (!editor.state.toolLocked && editor.state.tool !== ELEMENTS.DRAW) {
                    editor.state.tool = TOOLS.SELECT;
                }
                else {
                    // If tool is locked, we need to reset the current selection
                    element.selected = false;
                }
                // Terrible hack to enable editing in a text element
                if (element.type === ELEMENTS.TEXT) {
                    element.editing = true;
                    activeElement = element;
                    // action = ACTIONS.EDIT;
                    return update();
                }
            }
            // else if (action === ACTIONS.TRANSLATE || action === ACTIONS.RESIZE) {
            else if (editor.state.tool === TOOLS.SELECT && snapshot.length > 0) {
                if (isDragged || isResized) {
                    if (event.handler && snapshot.length === 1) {
                        const element = editor.getElement(snapshot[0].id);
                        const elementConfig = getElementConfig(element);
                        if (typeof elementConfig.onResizeEnd === "function") {
                            elementConfig.onResizeEnd(element, snapshot[0], event);
                        }
                    }
                    const selectedElements = editor.getSelection();
                    selectedElements.forEach(el => el[FIELDS.VERSION] = el[FIELDS.VERSION] + 1);
                    editor.addHistory({
                        type: CHANGES.UPDATE,
                        elements: selectedElements.map((element, index) => {
                            const updatedFields = new Set(["x1", "x2", "y1", "y2", "version"]);
                            // We need to check the fields that the element has updated internally
                            const elementConfig = getElementConfig(element);
                            if (typeof elementConfig.getUpdatedFields === "function") {
                                (elementConfig.getUpdatedFields(element, snapshot[index]) || []).forEach(key => {
                                    updatedFields.add(key);
                                });
                            }
                            // Generate list of fields to update
                            const keys = Array.from(updatedFields);
                            return {
                                id: element.id,
                                prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                                newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                            };
                        }),
                    });
                    editor.dispatchChange();
                }
                else if (event.element) {
                    const element = editor.getElement(event.element);
                    if (!event.shiftKey) {
                        editor.clearSelection();
                        element.selected = true;
                    }
                    else {
                        // Toggle element selection
                        element.selected = !isPrevSelected;
                    }
                    // Select all elements of this group
                    if (element.group && !editor.page.activeGroup) {
                        editor.getElements().forEach(el => {
                            el.selected = el.group === element.group ? element.selected : el.selected;
                        });
                    }
                }
                isDragged = false;
                isResized = false;
            }
            // else if (editor.state.action === ACTIONS.SELECT) {
            else if (editor.state.tool === TOOLS.SELECT && !!editor.state.selection) {
                const selection = editor.state.selection;
                editor.setSelectionArea({
                    x1: Math.min(selection.x1, selection.x2),
                    x2: Math.max(selection.x1, selection.x2),
                    y1: Math.min(selection.y1, selection.y2),
                    y2: Math.max(selection.y1, selection.y2),
                });
            }
            // else if (editor.state.action === ACTIONS.SCREENSHOT) {
            //     editor.state.exportVisible = true;
            //     editor.state.exportRegion = {...editor.state.selection};
            // }
            editor.state.selection = null;
            // action = null;
            update();
        };

        // @description handle double click 
        // @param {object} event
        // @param {string} event.element identifier of the the element where the user has clicked
        const onDoubleClickElement = event => {
            if (!editor.page.readonly && editor.state.tool === TOOLS.SELECT) {
                // board.clearSelectedElements();
                const element = editor.getElement(event.element);
                // Check for entering in group edition mode
                if (!editor.page.activeGroup && element.group) {
                    editor.page.activeGroup = element.group;
                    editor.clearSelection();
                    element.selected = true; // Mark this element as selected
                }
                else if (element && !element.locked) {
                    activeElement = element;
                    activeElement.editing = true;
                    // editor.state.action = ACTIONS.EDIT;
                }
                update();
            }
        };
            
        // @description handle key down
        // @param {object} event
        // @param {string} event.key key pressed
        // @param {boolean} event.ctrlKey true if the ctrl key is pressed
        // @param {boolean} event.metaKey true if the meta key is pressed
        // @param {boolean} event.shiftKey true if the shift key is pressed
        const onKeyDown = event => {
            if (editor.page.readonly) {
                return null;
            }
            const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
            // Check if we are in an input target and input element is active
            if (isInputTarget(event)) {
                if (activeElement?.editing && event.key === KEYS.ESCAPE) {
                    event.preventDefault();
                    activeElement.editing = false; // Stopediting element
                    if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                        removeTextElement(activeElement);
                    }
                    // Force to reset the active element
                    activeElement = null;
                    update();
                }
            }
            // Check ESCAPE key
            else if (event.key === KEYS.ESCAPE) {
                // if (editor.state.action === ACTIONS.SCREENSHOT) {
                //     editor.state.action = null;
                // }
                // Check for active group enabled --> exit group edition
                if (editor?.page?.activeGroup) {
                    editor.page.activeGroup = null;
                }
                event.preventDefault();
                editor.clearSelection();
                update();
            }
            // Check for arrow keys --> move elements
            else if (!isCtrlKey && isArrowKey(event.key)) {
                event.preventDefault();
                // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                const selectedElements = editor.getSelection();
                editor.addHistory({
                    type: CHANGES.UPDATE,
                    ids: selectedElements.map(el => el.id).join(","),
                    keys: `${dir}1,${dir}2`,
                    elements: selectedElements.map(el => {
                        const snapshot = {...el};
                        const field1 = `${dir}1`, field2 = `${dir}2`;
                        const elementConfig = getElementConfig(el);
                        const fields = [field1, field2];
                        if (typeof elementConfig.getUpdatedFields === "function") {
                            (elementConfig.getUpdatedFields(el) || []).forEach(f => fields.push(f));
                        }
                        // Assign the new values to the element
                        el[field1] = event.shiftKey ? snapshot[field1] + sign : getPosition(snapshot[field1] + sign * GRID_SIZE);
                        el[field2] = event.shiftKey ? snapshot[field2] + sign : getPosition(snapshot[field2] + sign * GRID_SIZE);
                        // Check for updating additional field on drag
                        if (typeof elementConfig.onDrag === "function") {
                            elementConfig.onDrag(el, snapshot, null);
                        }
                        // Return updated values
                        return {
                            id: el.id,
                            prevValues: Object.fromEntries(fields.map(field => {
                                return [field, snapshot[field]];
                            })),
                            newValues: Object.fromEntries(fields.map(field => {
                                return [field, el[field]];
                            })),
                        };
                    }),
                });
                editor.dispatchChange();
                update();
            }
            // otherwhise check for the action by the key combination
            else {
                // 1. check if this combination is an action shortcut
                const action = getActionByKeysCombination(event.key, event.code, isCtrlKey, event.altKey, event.shiftKey);
                if (action) {
                    event.preventDefault();
                    return dispatchAction(action);
                }
                // 2. check if this combination is a tool shortcut
                if (!isCtrlKey && !event.shiftKey) {
                    const tool = getToolByShortcut(tools, event.key);
                    if (tool) {
                        event.preventDefault();
                        tool.onSelect();
                    }
                }
            }
        };

        // @description handle element change
        // @param {object} event
        // @param {string} event.element identifier of the the element where the user has clicked
        // @param {object} event.keys list of keys to update
        // @param {object} event.values list of values to update
        const onElementChange = event => {
            if (activeElement?.id === event.element && activeElement?.editing) {
                editor.updateElements([activeElement], event.keys, event.values, true);
                editor.dispatchChange();
                update();
            }
        };

        // @description handle element blur
        const onElementBlur = () => {
            editor.getElements().forEach(element => {
                element.editing = false;
            });
            update();
        };

        // @description handle paste event
        // @param {object} event
        // @param {object} event.clipboardData clipboard data
        // @param {string} event.clipboardData.types list of clipboard data types
        // @param {string} event.clipboardData.getData get data from clipboard
        const onPaste = event => {
            if (!isInputTarget(event) && !editor.page.readonly) {
                editor.page.activeGroup = null;
                dispatchAction(ACTIONS.PASTE, {event: event});
            }
        };

        // onWheel: event => {
        //     if (!isInputTarget(event)) {
        //         const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
        //         // CTRL KEY --> apply zooming
        //         if (isCtrlKey) {
        //             event.deltaY < 0 ? board.zoomIn() : board.zoomOut();
        //         }
        //         // NO CTRL_KEY --> apply translation
        //         else {
        //             board.translateX = board.translateX - event.deltaX;
        //             board.translateY = board.translateY - event.deltaY;
        //             board.update();
        //         }
        //     }
        // },

        // return the listeners
        return {
            onPointCanvas,
            onPointElement,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onDoubleClickElement,
            onKeyDown,
            onElementChange,
            onElementBlur,
            onPaste,
        };

    }, [editor, update, hideContextMenu, tools]);
};
