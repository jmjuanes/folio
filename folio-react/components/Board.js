import React from "react";

import {
    KEYS,
    INTERACTION_MODES,
    TEXT_ALIGNS,
    TEXT_VERTICAL_ALIGNS,
    ELEMENT_TYPES,
    ELEMENT_CHANGE_TYPES,
    RESIZE_ORIENTATIONS,
    DEFAULT_ELEMENT_RESIZE_RADIUS,
    DEFAULT_ELEMENT_SELECTION_OFFSET,
    DEFAULT_ELEMENT_SELECTION_COLOR,
    DEFAULT_ELEMENT_SELECTION_WIDTH,
    DEFAULT_ELEMENT_RESIZE_COLOR,
    DEFAULT_ELEMENT_RESIZE_WIDTH,
    DEFAULT_GROUP_SELECTION_OFFSET,
    DEFAULT_GROUP_SELECTION_COLOR,
    DEFAULT_GROUP_SELECTION_WIDTH,
} from "../constants.js";

import {createContext} from "../board/context.js";
import {
    createElement,
    updateElement,
    drawElement,
    addElement,
    removeElement,
} from "../board/elements.js";
import {getGroup, groupSelection, selectAllElementsInGroup, ungroupSelection} from "../board/groups.js";
import {
    addHistoryEntry,
    registerElementCreate,
    registerElementRemove,
    registerSelectionRemove,
    registerSelectionUpdate,
} from "../board/history.js";
import {
    fixResizeOrientation,
    getResizePoints,
    inResizePoint,
} from "../board/resize.js";
import {
    clearSelection,
    getSelection,
    isSelectionLocked,
    removeSelection,
    setSelection,
    snapshotSelection,
} from "../board/selection.js";
import {
    isInputTarget,
    forEachRev,
    createImage,
    measureText,
} from "../utils/index.js";
import {getAbsolutePositions} from "../utils/math.js";
import {parseClipboardBlob, getDataFromClipboard} from "../utils/clipboard.js";
import {screenshotCanvas} from "../utils/canvas.js";

import {When} from "../commons/When.js";

// Check for arrow keys
const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};

export const Board = React.forwardRef((props, ref) => {
    const canvasRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const ctx = React.useRef(null);
    const [inputVisible, setInputVisible] = React.useState(false);

    // Trigger the update event
    const triggerUpdate = () => {
        return typeof props.onUpdate === "function" && props.onUpdate();
    };

    // Calculate the position using the grid size
    const getPosition = v => {
        return props.gridEnabled ? Math.round(v / props.gridSize) * props.gridSize : v;
    };

    // Draw the canvas
    const draw = () => {
        const canvas = canvasRef.current.getContext("2d");
        const renderedGroups = new Set();
        canvas.clearRect(0, 0, ctx.current.width, ctx.current.height);
        forEachRev(ctx.current.elements, element => {
            const shouldDrawInnerText = ctx.current.mode !== INTERACTION_MODES.INPUT || ctx.current.currentElement?.id !== element.id;            
            drawElement(element, canvas, shouldDrawInnerText);

            // Check if this element is selected --> draw selection area
            if (shouldDrawInnerText && element.selected === true && element.type !== ELEMENT_TYPES.SELECTION) {
                const radius = DEFAULT_ELEMENT_RESIZE_RADIUS;
                const offset = DEFAULT_ELEMENT_SELECTION_OFFSET;
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                canvas.globalAlpha = 1.0;
                canvas.beginPath();
                canvas.setLineDash([8, 4]);
                canvas.strokeStyle = DEFAULT_ELEMENT_SELECTION_COLOR;
                canvas.lineWidth = DEFAULT_ELEMENT_SELECTION_WIDTH;
                canvas.rect(xStart - offset, yStart - offset, xEnd - xStart + 2 * offset, yEnd - yStart + 2 * offset);
                canvas.stroke();
                canvas.setLineDash([]); // Reset line-dash
                // Check if is the unique selected elements
                if (ctx.current.selection.length === 1 && element.locked === false) {
                    getResizePoints(element, offset).forEach(p => {
                        canvas.beginPath();
                        canvas.strokeStyle = DEFAULT_ELEMENT_RESIZE_COLOR;
                        canvas.lineWidth = DEFAULT_ELEMENT_RESIZE_WIDTH;
                        canvas.fillStyle = "rgb(255,255,255)";
                        canvas.rect(p.x + p.xs * 2 * radius, p.y + p.ys * 2 * radius, 2 * radius, 2 * radius);
                        canvas.fill();
                        canvas.stroke();
                    });
                }
            }
            
            // Render group selection
            if (ctx.current.mode === INTERACTION_MODES.NONE && element.group) {
                if (!renderedGroups.has(element.group) && (element.selected || ctx.current.currentGroup === element.group)) {
                    const offset = DEFAULT_GROUP_SELECTION_OFFSET;
                    const group = getGroup(ctx.current, element.group);
                    canvas.globalAlpha = 1.0;
                    canvas.beginPath();
                    canvas.setLineDash([4, 2]);
                    canvas.strokeStyle = DEFAULT_GROUP_SELECTION_COLOR;
                    canvas.lineWidth = DEFAULT_GROUP_SELECTION_WIDTH;
                    canvas.rect(group.x - offset, group.y - offset, group.width + 2 * offset, group.height + 2 * offset);
                    canvas.stroke();
                    canvas.setLineDash([]);
                }
                renderedGroups.add(element.group);
            }
        });
    };

    const submitInput = () => {
        const first = ctx.current.history[0] || null;
        const value = inputRef.current.value || "";
        const element = ctx.current.currentElement;
        const prevContent = element.textContent;
        element.selected = true;
        ctx.current.selection = getSelection(ctx.current);
        ctx.current.selectionLocked = false;
        if (value || element.type !== ELEMENT_TYPES.TEXT) {
            if (first?.type === ELEMENT_CHANGE_TYPES.CREATE && first.elements[0].id === element.id && !prevContent) {
                first.elements[0].textContent = value; // Replace the value in history
            } else {
                registerSelectionUpdate(ctx.current, ["textContent"], [value], false);
            }
            element.textContent = value;
            updateElement(element, ["textContent"]);
        } else {
            if (first?.type === ELEMENT_CHANGE_TYPES.CREATE && first.elements[0].id === element.id && !prevContent) {
                ctx.current.history.shift(); // remove this from history
            } else {
                registerElementRemove(ctx.current, element);
            }
            removeElement(ctx.current, element);
            ctx.current.selection = getSelection(ctx.current);
        }
        ctx.current.currentElement = null;
        ctx.current.mode = INTERACTION_MODES.NONE; // Reset mode
        inputRef.current.blur();
        setInputVisible(false);
    };

    React.useEffect(() => {
        ctx.current = createContext(props);
        ref.current = {
            resize: () => handleResize(),
            clear: () => {
                ctx.current.elements = [];
                ctx.current.selection = [];
                ctx.current.currentElement = null;
                ctx.current.currentGroup = null;
                return draw();
            },
            load: () => null,
            export: () => ({
                elements: ctx.current.elements.map(element => ({
                    ...element,
                    selected: false,
                })),
                width: ctx.current.width,
                height: ctx.current.height,
            }),
            setType: type => {
                clearSelection(ctx.current);
                ctx.current.type = type || ELEMENT_TYPES.SELECTION;
                draw();
            },
            getType: () => ctx.current.type,
            updateSelection: (key, value) => {
                registerSelectionUpdate(ctx.current, [key], [value], true);
                ctx.current.selection.forEach(element => {
                    element[key] = value;
                    updateElement(element, [key]);
                });
                draw();
            },
            // cloneSelection: () => {
            //     const newElements = [];
            //     // Update the selection with the cloned elements
            //     ctx.selection = ctx.selection.map(element => {
            //         const clonedElement = {
            //             ...element,
            //             x: element.x + 10,
            //             y: element.y + 10,
            //             locked: false, // Reset locked attribute
            //         };
            //         newElements.push(clonedElement); // Save to the elements list
            //         element.selected = false; // Remove this element from selection
            //         return clonedElement;
            //     });
            //     forEachRev(newElements, el => ctx.elements.unshift(el));
            //     ctx.selectionLocked = false; // Reset selection locked flag
            //     ctx.draw();
            // },
            lockSelection: () => {
                registerSelectionUpdate(ctx.current, ["locked"], [true], false);
                ctx.current.selectionLocked = true;
                ctx.current.selection.forEach(element => element.locked = true);
                draw();
            },
            unlockSelection: () => {
                registerSelectionUpdate(ctx.current, ["locked"], [false], false);
                ctx.current.selectionLocked = false;
                ctx.current.selection.forEach(element => element.locked = false);
                draw();
            },
            clearSelection: () => {
                clearSelection(ctx.current);
                draw();
            },
            removeSelection: () => {
                registerSelectionRemove(ctx.current);
                removeSelection(ctx.current);
                draw();
            },
            bringSelectionForward: () => {
                // forEachRev(ctx.selection, element => {
                //     const index = ctx.elements.findIndex(el => el.id === element.id);
                //     ctx.elements.splice(index, 1);
                //     ctx.elements.splice(Math.max(index - 1, 0), 0, element);
                // });
                // ctx.draw();
            },
            sendSelectionBackward: () => {
                // ctx.selection.forEach(element => {
                //     const index = ctx.elements.findIndex(el => el.id === element.id);
                //     ctx.elements.splice(index, 1);
                //     ctx.elements.splice(Math.min(index + 1, ctx.elements.length), 0, element);
                // });
                // ctx.draw();
            },
            getSelection: () => ctx.current.selection,
            isSelectionLocked: () => ctx.current.selectionLocked,
            groupSelection: () => {
                groupSelection(ctx.current);
                draw();
            },
            ungroupSelection: () => {
                ungroupSelection(ctx.current);
                draw();
            },
            getActiveGroup: () => ctx.current.currentGroup,
            undo: () => {
                if (ctx.current.historyIndex < ctx.current.history.length) {
                    const entry = ctx.current.history[ctx.current.historyIndex];
                    if (entry.type === ELEMENT_CHANGE_TYPES.CREATE) {
                        const removeElements = new Set(entry.elements.map(el => el.id));
                        ctx.current.elements = ctx.current.elements.filter(el => !removeElements.has(el.id));
                    } else if (entry.type === ELEMENT_CHANGE_TYPES.REMOVE) {
                        entry.elements.forEach(el => ctx.current.elements.unshift({...el.prevValues}));
                    } else if (entry.type === ELEMENT_CHANGE_TYPES.UPDATE) {
                        entry.elements.forEach(element => {
                            Object.assign(ctx.current.elements.find(el => el.id === element.id), element.prevValues);
                        });
                    }
                    ctx.current.historyIndex = ctx.current.historyIndex + 1;
                    clearSelection(ctx.current);
                    ctx.current.currentGroup = null;
                    draw();
                }
            },
            redo: () => {
                if (ctx.current.historyIndex > 0 && ctx.current.history.length > 0) {
                    ctx.current.historyIndex = ctx.current.historyIndex - 1;
                    const entry = ctx.current.history[ctx.current.historyIndex];
                    if (entry.type === ELEMENT_CHANGE_TYPES.CREATE) {
                        entry.elements.forEach(el => ctx.current.elements.unshift({...el.newValues}));
                    } else if (entry.type === ELEMENT_CHANGE_TYPES.REMOVE) {
                        const removeElements = new Set(entry.elements.map(el => el.id));
                        ctx.current.elements = ctx.current.elements.filter(el => !removeElements.has(el.id));
                    } else if (entry.type === ELEMENT_CHANGE_TYPES.UPDATE) {
                        entry.elements.forEach(element => {
                            Object.assign(ctx.current.elements.find(el => el.id === element.id) || {}, element.newValues);
                        });
                    }
                    clearSelection(ctx.current);
                    ctx.current.currentGroup = null;
                    draw();
                }
            },
            isUndoDisabled: () => ctx.current.historyIndex >= ctx.current.history.length,
            isRedoDisabled: () => ctx.current.historyIndex === 0 || ctx.current.history.length < 1,
            screenshot: region => screenshotCanvas(canvasRef.current, region),
        };

        // Handle paste
        const handlePaste = event => {
            return !isInputTarget(event) && getDataFromClipboard(event).then(data => {
                clearSelection(ctx.current);
                ctx.current.currentGroup = null;
                parseClipboardBlob(data.type, data.blob).then(content => {
                    // Check for not image type
                    if (data.type !== "image") {
                        const element = createElement({
                            type: ELEMENT_TYPES.TEXT,
                            textContent: content,
                        });
                        addElement(ctx.current, element);
                        updateElement(element, ["x", "y", "textContent"]);
                        registerElementCreate(ctx.current, element);
                        draw();
                        return triggerUpdate();
                    }
                    // Load as a new image
                    createImage(content).then(img => {
                        const element = createElement({
                            type: ELEMENT_TYPES.IMAGE,
                            width: img.width,
                            height: img.height,
                            img: img,
                        });
                        addElement(ctx.current, element);
                        updateElement(element, ["img", "width", "height"]);
                        registerElementCreate(ctx.current, element);
                        draw();
                        return triggerUpdate();
                    });
                });
            });
        };

        // Handle document key down
        const handleKeyDown = event => {
            if (ctx.current.mode === INTERACTION_MODES.INPUT || isInputTarget(event)) {
                if (ctx.current.mode === INTERACTION_MODES.INPUT && event.key === KEYS.ESCAPE) {
                    event.preventDefault();
                    submitInput();
                    draw();
                    triggerUpdate();
                }
            }
            // Check ESCAPE key --> reset selection
            else if (event.key === KEYS.ESCAPE) {
                event.preventDefault();
                clearSelection(ctx.current);
                ctx.current.currentGroup = null;
                draw();
                triggerUpdate();
            }
            // Check for backspace key --> remove elements
            else if (event.key === KEYS.BACKSPACE) {
                event.preventDefault();
                registerSelectionRemove(ctx);
                removeSelection(ctx);
                draw();
                triggerUpdate();
            }
            // Check for arrow keys --> move elements
            else if (isArrowKey(event.key) === true) {
                event.preventDefault();
                const step = props.gridEnabled ? props.gridSize : (event.shiftKey ? 5 : 1);
                const key = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;

                addHistoryEntry(ctx.current, {
                    type: ELEMENT_CHANGE_TYPES.UPDATE,
                    ids: ctx.current.selection.map(el => el.id).join(","),
                    keys: key,
                    elements: ctx.current.selection.map(element => {
                        const prevValue = element[key];
                        element[key] = prevValue + step * sign;
                        return {
                            id: element.id,
                            prevValues: {[key]: prevValue},
                            newValues: {[key]: element[key]},
                        };
                    }),
                });
                draw();
                triggerUpdate();
            }
        };

        // Handle pointer down event
        const handlePointerDown = event => {
            event.preventDefault();

            // Remove current selection
            const currentSelection = document.getSelection();
            if (currentSelection?.anchorNode) {
                currentSelection.removeAllRanges();
            }

            // Check for text input mode --> submit text
            if (ctx.current.mode === INTERACTION_MODES.INPUT) {
                submitInput();
                draw();
                return triggerUpdate();
            }

            ctx.current.currentElement = null;
            ctx.current.lastX = event.offsetX; // event.clientX - event.target.offsetLeft;
            ctx.current.lastY = event.offsetY; // event.clientY - event.target.offsetTop;
            ctx.current.currentElementDragged = false;
            ctx.current.currentElementSelected = false;

            // Check if we are in a resize point
            if (ctx.current.selection.length === 1) {
                const radius = 2 * DEFAULT_ELEMENT_RESIZE_RADIUS;
                const offset = DEFAULT_ELEMENT_SELECTION_OFFSET;
                const point = inResizePoint(ctx.current.selection[0], ctx.lastX, ctx.lastY, radius, offset);
                if (point) {
                    ctx.current.currentElement = ctx.current.selection[0]; // Save current element
                    ctx.current.resizeOrientation = fixResizeOrientation(ctx.current.currentElement, point.orientation);
                    ctx.current.mode = INTERACTION_MODES.RESIZE; // Swtich to resize mode
                    ctx.current.snapshot = snapshotSelection(ctx.current.selection); // Create a snapshot of the selection
                    return; // Stop event
                }
            }
            // Check the selected type
            if (ctx.current.type === ELEMENT_TYPES.SELECTION) {
                // Check if the point is inside an element
                const insideElements = ctx.current.elements.filter(element => {
                    const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                    const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                    // Check if the position is inside the element
                    return (xStart <= ctx.current.lastX && ctx.current.lastX <= xEnd) 
                        && (yStart <= ctx.current.lastY && ctx.current.lastY <= yEnd);
                });
                if (insideElements.length > 0) {
                    const el = insideElements[0]; // Get only the first element
                    ctx.current.currentElement = el; // Save the current dragged element
                    ctx.current.currentElementSelected = el.selected; // Save if element is already selected
                    ctx.current.mode = INTERACTION_MODES.DRAG;
                    // Check if this element is not selected
                    if (el.selected === false && !event.shiftKey) {
                        clearSelection(ctx.current);
                    }
                    // Add elements of this group
                    if (!ctx.current.currentGroup && el.group) {
                        selectAllElementsInGroup(ctx.current, el.group);
                    }
                    el.selected = true;
                    ctx.current.selection = getSelection(ctx.current);
                    ctx.current.snapshot = snapshotSelection(ctx.current.selection);
                    ctx.current.selectionLocked = isSelectionLocked(ctx.current);
                    return; // Stop event
                }
            }
            // Create a new element
            const element = createElement({
                type: ctx.current.type,
                x: getPosition(ctx.current.lastX), 
                y: getPosition(ctx.current.lastY),
            });
            ctx.current.elements.unshift(element);
            ctx.current.currentElement = element;
            clearSelection(ctx.current);

            // Check if we should clear the current group
            if (ctx.current.currentGroup && element.type === ELEMENT_TYPES.SELECTION) {
                const g = getGroup(ctx.current, ctx.current.currentGroup);
                if (element.x < g.x || g.x + g.width < element.x || element.y < g.y || g.y + g.height < element.y) {
                    ctx.current.currentGroup = null; // Reset current group
                }
            } else {
                // Clear the current group just in case
                ctx.current.currentGroup = null;
            }
        };

        // Handle pointer move
        const handlePointerMove = event => {
            event.preventDefault();
            const x = event.offsetX; // event.clientX - event.target.offsetLeft;
            const y = event.offsetY; // event.clientY - event.target.offsetTop;
            // Check for no selected elements
            if (!ctx.current.currentElement || ctx.current.mode === INTERACTION_MODES.INPUT) {
                return;
            }
            ctx.current.currentElementDragged = true;
            // Check if we are resizing the element
            if (ctx.current.mode === INTERACTION_MODES.RESIZE) {
                if (ctx.current.currentElement.locked) {
                    return null;
                }
                const element = ctx.current.currentElement;
                const snapshot = ctx.current.snapshot[0]; // Get snapshot of the current element
                const orientation = ctx.current.resizeOrientation;
                const deltaX = x - ctx.current.lastX; // ctx.getPosition(x - ctx.lastX);
                const deltaY = y - ctx.current.lastY; // ctx.getPosition(y - ctx.lastY);
                // Check the orientation
                if (orientation === RESIZE_ORIENTATIONS.RIGHT) {
                    element.width = getPosition(element.x + snapshot.width + deltaX) - element.x;
                }
                else if (orientation === RESIZE_ORIENTATIONS.LEFT) {
                    element.x = getPosition(snapshot.x + deltaX);
                    element.width = snapshot.width + (snapshot.x - element.x);
                }
                else if (orientation === RESIZE_ORIENTATIONS.BOTTOM) {
                    element.height = getPosition(element.y + snapshot.height + deltaY) - element.y;
                }
                else if (orientation === RESIZE_ORIENTATIONS.TOP) {
                    element.y = getPosition(snapshot.y + deltaY);
                    element.height = snapshot.height + (snapshot.y - element.y);
                }
                else if (orientation === RESIZE_ORIENTATIONS.LEFT_TOP) {
                    element.x = getPosition(snapshot.x + deltaX);
                    element.y = getPosition(snapshot.y + deltaY);
                    element.width = snapshot.width + (snapshot.x - element.x);
                    element.height = snapshot.height + (snapshot.y - element.y);
                }
                else if (orientation === RESIZE_ORIENTATIONS.RIGHT_TOP) {
                    element.y = getPosition(snapshot.y + deltaY);
                    element.height = snapshot.height + (snapshot.y - element.y);
                    element.width = getPosition(element.x + snapshot.width + deltaX) - element.x;
                }
                else if (orientation === RESIZE_ORIENTATIONS.LEFT_BOTTOM) {
                    element.x = getPosition(snapshot.x + deltaX);
                    element.width = snapshot.width + (snapshot.x - element.x);
                    element.height = getPosition(element.y + snapshot.height + deltaY) - element.y;
                }
                else if (orientation === RESIZE_ORIENTATIONS.RIGHT_BOTTOM) {
                    element.width = getPosition(element.x + snapshot.width + deltaX) - element.x;
                    element.height = getPosition(element.y + snapshot.height + deltaY) - element.y;
                }
            }
            // Check if we have selected elements
            else if (ctx.current.mode === INTERACTION_MODES.DRAG && ctx.current.selection.length > 0) {
                if (ctx.current.selectionLocked) {
                    return null; // Move is not allowed --> selection is locked
                }
                const incrementX = x - ctx.lastX;
                const incrementY = y - ctx.lastY;
                // Move all elements
                ctx.current.selection.forEach((element, index) => {
                    if (!element.locked) {
                        element.x = getPosition(ctx.current.snapshot[index].x + incrementX);
                        element.y = getPosition(ctx.current.snapshot[index].y + incrementY);
                    }
                });
            }
            // Check if we have a drag element (but not text)
            else if (ctx.current.currentElement && ctx.current.currentElement.type !== ELEMENT_TYPES.TEXT) {
                const element = ctx.current.currentElement;
                const deltaX = getPosition(x - element.x);
                //let deltaY = this.ctx.getPosition(y - element.y);
                element.width = deltaX;
                element.height = event.shiftKey ? deltaX : getPosition(y - element.y);

                // Check if the elemement is a selection
                if (element.type === ELEMENT_TYPES.SELECTION) {
                    setSelection(ctx.current, element);
                }
            }
            // Check for text element --> update only text position
            else if (ctx.current.currentElement && ctx.current.currentElement.type === ELEMENT_TYPES.TEXT) {
                ctx.current.currentElement.x = getPosition(x);
                ctx.current.currentElement.y = getPosition(y);
            }

            draw();
        };

        // Handle pointer up
        const handlePointerUp = event => {
            event.preventDefault();
            // Check for no current element active
            if (!ctx.current.currentElement || ctx.current.mode === INTERACTION_MODES.INPUT) {
                return;
            }
            // Check for clicked element
            if (!ctx.current.currentElementDragged && ctx.current.selection.length > 0) {
                if (ctx.current.currentElementSelected === true && event.shiftKey) {
                    ctx.current.currentElement.selected = false;
                }
                // Check if no shift key is pressed --> keep only this current element in selection
                else if (!event.shiftKey) {
                    clearSelection(ctx.current);
                    ctx.current.currentElement.selected = true;
                }
                // Check if this elements is part of a group
                // This will disable the shift action if the element is in a group
                if (ctx.current.currentElement.group && !ctx.current.currentGroup) {
                    selectAllElementsInGroup(ctx.current, ctx.current.currentElement.group);
                }
            }
            // Check for adding a new element
            if (ctx.current.type !== ELEMENT_TYPES.SELECTION && ctx.current.type !== ELEMENT_TYPES.SCREENSHOT) {
                ctx.current.currentElement.selected = true;
                updateElement(ctx.current.currentElement, ["selected"]);
                registerElementCreate(ctx.current, ctx.current.currentElement);
            }
            // Remove selection elements
            else {
                ctx.current.elements = ctx.current.elements.filter(element => {
                    return element.type !== ELEMENT_TYPES.SELECTION && element.type !== ELEMENT_TYPES.SCREENSHOT;
                });
            }
            // Check for screenshot element
            if (ctx.current.type === ELEMENT_TYPES.SCREENSHOT) {
                const [xStart, xEnd] = getAbsolutePositions(ctx.current.currentElement.x, ctx.current.currentElement.width);
                const [yStart, yEnd] = getAbsolutePositions(ctx.current.currentElement.y, ctx.current.currentElement.height);
                props.onScreenshot && props.onScreenshot({
                    x: xStart,
                    width: xEnd - xStart,
                    y: yStart,
                    height: yEnd - yStart,
                });
            }
            else if (ctx.current.selection.length > 0 || ctx.current.currentElementDragged) {
                if (ctx.current.mode === INTERACTION_MODES.DRAG || ctx.current.mode === INTERACTION_MODES.RESIZE) {
                    const keys = ctx.current.mode === INTERACTION_MODES.DRAG ? ["x", "y"] : ["x", "y", "width", "height"];
                    addHistoryEntry(ctx.current, {
                        type: ELEMENT_CHANGE_TYPES.UPDATE,
                        elements: ctx.current.selection.map((element, index) => ({
                            id: element.id,
                            prevValues: Object.fromEntries(keys.map(key => [key, ctx.current.snapshot[index][key]])),
                            newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                        })),
                    });
                }
            }
            // Check for text element
            if (ctx.current.type === ELEMENT_TYPES.TEXT) {
                ctx.current.currentElement.selected = false; // Disable selection
                ctx.current.mode = INTERACTION_MODES.INPUT;
                setInputVisible(true);
            }
            // If no text element, reset current element
            else {
                ctx.current.currentElement = null;
                ctx.current.mode = INTERACTION_MODES.NONE;
            }

            // Reset selection
            ctx.current.selection = getSelection(ctx.current)
            ctx.current.selectionLocked = isSelectionLocked(ctx.current);
            ctx.current.type = ELEMENT_TYPES.SELECTION;
            draw();
            triggerUpdate();
        };

        // Handle double click
        const handleDoubleClick = event => {
            event.preventDefault();
            // Check if all selected elements are in a group
            if (ctx.current.selection.length > 0 && !ctx.current.currentGroup) {
                const group = ctx.current.selection[0].group;
                const sameGroup = ctx.current.selection.every(el => el.group === group);
                if (group && sameGroup) {
                    clearSelection(ctx.current);
                    ctx.current.currentGroup = group;
                    draw();
                    return triggerUpdate();
                }
            }
            if (ctx.current.selection.length === 1 && typeof ctx.current.selection[0].textContent === "string") {
                ctx.current.currentElement = ctx.current.selection[0];
            }
            else {
                ctx.current.currentElement = createElement({
                    type: ELEMENT_TYPES.TEXT,
                    x: parseInt(event.clientX),
                    y: parseInt(event.clientY),
                });
                ctx.current.elements.unshift(ctx.current.currentElement);
                registerElementCreate(ctx.current, ctx.current.currentElement);
            }
            ctx.current.mode = INTERACTION_MODES.INPUT;
            clearSelection(ctx.current);
            setInputVisible(true);
            draw();
            triggerUpdate();
        };

        // Handle window resize
        const handleResize = () => {
            ctx.current.width = canvasRef.current.parent.offsetWidth;
            ctx.current.height = canvasRef.current.parent.offsetHeight;
            canvasRef.current.setAttribute("width", ctx.current.width + "px");
            canvasRef.current.setAttribute("height", ctx.current.height + "px");
            // ctx.canvasGrid.setAttribute("width", ctx.width + "px");
            // ctx.canvasGrid.setAttribute("height", ctx.height + "px");
            draw();
            // ctx.drawGrid();
        };

        // Register event listeners
        canvasRef.current.addEventListener("pointerdown", handlePointerDown);
        canvasRef.current.addEventListener("pointermove", handlePointerMove);
        canvasRef.current.addEventListener("pointerup", handlePointerUp);
        canvasRef.current.addEventListener("dblclick", handleDoubleClick);

        // Register document event listeners
        document.addEventListener("keydown", handleKeyDown, false);
        document.addEventListener("paste", handlePaste, false);
        window.addEventListener("resize", handleResize, false);

        // Force a resize of the canvas
        handleResize();

        // Remove all event listeners
        return () => {
            document.removeEventListener("keydown", handleKeyDown, false);
            document.removeEventListener("paste", handlePaste, false);
            window.removeEventListener("resize", handleResize, false);
            // Reset body styles
            // document.querySelector("body").style.overflow = "";
        };
    }, []);

    // Listen to inputVisible changes
    React.useEffect(() => {
        if (inputVisible) {
            const el = ctx.current.currentElement;
            const updateInput = () => {
                inputRef.current.style.height = "1em";
                const size = measureText(inputRef.current.value || "", el.textSize, el.textFont);
                const width = Math.max(size.width + 1, el.width);
                const height = inputRef.current.scrollHeight; // .max(ctx.input.scrollHeight, ctx.currentElement.height);
                inputRef.current.style.width = width;
                inputRef.current.style.height = height;

                // Move text input to the correct position
                if (el.type !== ELEMENT_TYPES.TEXT) {
                    // Vertical align
                    if (el.textVerticalAlign === TEXT_VERTICAL_ALIGNS.MIDDLE) {
                        inputRef.current.style.top = el.y + (el.height - height) / 2;
                    }
                    else if (el.textVerticalAlign === TEXT_VERTICAL_ALIGNS.BOTTOM) {
                        inputRef.current.style.top = el.y + (el.height - height);
                    }
                    // Horizontal align
                    if (el.textAlign === TEXT_ALIGNS.CENTER) {
                        inputRef.current.style.left = el.x - (width - el.width) / 2;
                    }
                    else if (el.textAlign === TEXT_ALIGNS.RIGHT) {
                        inputRef.current.style.left = el.x - (width - el.width);
                    }
                }
            };

            // Set input position and initial value
            inputRef.current.style.top = el.y + "px";
            inputRef.current.style.left = el.x + "px";
            inputRef.current.style.color = el.textColor;
            inputRef.current.style.fontSize = el.textSize + "px";
            inputRef.current.style.fontFamily = el.textFont;
            inputRef.current.style.textAlign = el.textAlign;
            inputRef.current.value = el.textContent || ""; // Get text content
            inputRef.current.style.display = "inline-block"; // Show input
            inputRef.current.focus(); // focus in the new input
            updateInput();

            inputRef.current.addEventListener("input", () => updateInput());
            inputRef.current.addEventListener("mousedown", e => e.stopPropagation());
            inputRef.current.addEventListener("mouseup", e => e.stopPropagation());
        }
    }, [inputVisible]);

    return (
        <React.Fragment>
            <canvas
                ref={canvasRef}
                style={{
                    bottom: "0px",
                    left: "0px",
                    position: "absolute",
                    top: "0px",
                    touchAction: "none",
                    userSelect: "none",
                }}
            />
            <When condition={inputVisible} render={() => (
                <input
                    ref={inputRef}
                    style={{
                        backgroundColor: "transparent",
                        border: "0px solid transparent",
                        display: "none",
                        lineHeight: "1",
                        margin: "0px",
                        minHeight: "1em",
                        minWidth: "1em",
                        outline: "0px",
                        overflow: "hidden",
                        padding: "3px 0px", // Terrible hack to fix text position
                        position: "absolute",
                        resize: "none",
                        whiteSpace: "break-word",
                        width: "auto",
                        wordBreak: "pre",
                    }}
                />
            )} />
        </React.Fragment>
    );
});

Board.defaultProps = {
    width: 0,
    height: 0,
    gridSize: 10,
    gridEnabled: false,
    onUpdate: null,
    onScreenshot: null,
};
