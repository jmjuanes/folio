import React from "react";

import {
    KEYS,
    EVENTS,
    MODES,
    TEXT_ALIGNS,
    TEXT_VERTICAL_ALIGNS,
    ELEMENT_TYPES,
    ELEMENT_CHANGE_TYPES,
    RESIZE_ORIENTATIONS,
    DEFAULT_ELEMENT_RESIZE_RADIUS,
    DEFAULT_ELEMENT_SELECTION_OFFSET,
    DEFAULT_GRID_COLOR,
    DEFAULT_GRID_OPACITY,
    DEFAULT_GRID_SIZE,
    DEFAULT_GRID_STYLE,
} from "./constants.js";

import {
    createElement,
    updateElement,
} from "./elements.js";
import {
    fixResizeOrientation,
    inResizePoint,
} from "./resize.js";
import {createImage} from "./utils/image.js";
import {generateID} from "./utils/generateId.js";
import {measureText} from "./utils/measureText.js";
import {
    getAbsolutePositions,
    getOuterRectangle,
    normalizeRegion,
} from "./utils/math.js";
import {parseClipboardBlob, getDataFromClipboard} from "./utils/clipboard.js";
import {screenshotCanvas, clearCanvas} from "./utils/canvas.js";
import {createBoard} from "./board.js";
import {drawBoard, drawGrid} from "./draw.js";

import {Menubar} from "./components/Menubar.js";
import {Stylebar} from "./components/Stylebar.js";
import {Toolbar} from "./components/Toolbar.js";
import {Historybar} from "./components/Historybar.js";
import {TextInput} from "./components/TextInput.js";
import {Canvas} from "./components/Canvas.js";

// Check for arrow keys
const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};

// Check if the provided event.target is related to an input element
const isInputTarget = e => {
    return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
};

export const Folio = React.forwardRef((props, apiRef) => {
    const parentRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const boardRef = React.useRef(null);
    const gridRef = React.useRef(null);
    const board = React.useRef(null);
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [state, setState] = React.useState({
        mode: MODES.SELECTION,
        elementType: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        gridEnabled: !!props.gridEnabled,
        gridColor: props.gridColor,
        gridSize: props.gridSize,
        gridStyle: props.gridStyle,
        gridOpacity: props.gridOpacity,
    });

    // Internal variables
    let orientation = null;
    let lastX = 0, lastY = 0;
    let boardX = state.x, boardY = state.y;
    let pointerMoveActive = false;
    let resize = false;
    let dragged = false;
    let isElementSelected = false;
    let snapshot = null;
    let element = null;

    // Initialize board API reference
    if (!board.current) {
        board.current = createBoard();
    }

    // Calculate the position using the grid size
    const getPosition = v => {
        return state.gridEnabled ? Math.round(v / state.gridSize) * state.gridSize : v;
    };

    // Get coordinates in the board
    const getXCoordinate = x => x - state.x;
    const getYCoordinate = y => y - state.y;

    // Draw the board
    const draw = () => {
        drawBoard(boardRef.current, board.current.elements, board.current.selection, {
            translateX: boardX,
            translateY: boardY,
            mode: state.mode,
            drawActiveInnerText: state.mode !== MODES.INPUT,
            activeElement: board.current.activeElement,
            activeGroup: board.current.activeGroup,
            pointerMoveActive: pointerMoveActive,
        });
    };

    const submitInput = () => {
        const first = board.current.history[0] || null;
        const value = inputRef.current.value || "";
        const element = board.current.activeElement;
        const prevContent = element.textContent;
        element.selected = true;
        if (value || element.type !== ELEMENT_TYPES.TEXT) {
            if (first?.type === ELEMENT_CHANGE_TYPES.CREATE && first.elements[0].id === element.id && !prevContent) {
                first.elements[0].textContent = value; // Replace the value in history
            } else {
                board.current.registerSelectionUpdate(["textContent"], [value], false);
            }
            element.textContent = value;
            updateElement(element, ["textContent"]);
        } else {
            if (first?.type === ELEMENT_CHANGE_TYPES.CREATE && first.elements[0].id === element.id && !prevContent) {
                board.current.history.shift(); // remove this from history
            } else {
                board.current.registerElementRemove(element);
            }
            board.current.removeElement(element);
        }
        board.current.activeElement = null;
        inputRef.current.blur();
        setState(prevState => ({
            ...prevState,
            mode: MODES.SELECTION,
        }));
    };

    const handlePointerDown = ({nativeEvent}) => {
        lastX = getXCoordinate(nativeEvent.offsetX); // event.clientX - event.target.offsetLeft;
        lastY = getYCoordinate(nativeEvent.offsetY); // event.clientY - event.target.offsetTop;
        // Remove current selection
        const currentSelection = document.getSelection();
        if (currentSelection?.anchorNode) {
            currentSelection.removeAllRanges();
        }
        // Check for text input mode --> submit text
        if (state.mode === MODES.INPUT) {
            return submitInput();
        }
        else if (state.mode === MODES.MOVE) {
            pointerMoveActive = true;
            if (state.gridEnabled) {
                clearCanvas(gridRef.current);
            }
        }
        else if (state.mode === MODES.SELECTION) {
            const selection = board.current.getSelectedElements();
            // Check if we are in a resize point
            if (selection.length === 1) {
                const radius = 2 * DEFAULT_ELEMENT_RESIZE_RADIUS;
                const offset = DEFAULT_ELEMENT_SELECTION_OFFSET;
                const point = inResizePoint(selection[0], lastX, lastY, radius, offset);
                if (point && !selection[0].locked) {
                    element = selection[0]; // Save current element
                    orientation = fixResizeOrientation(element, point.orientation);
                    snapshot = board.current.snapshotSelectedElements()[0];
                    resize = true;
                    pointerMoveActive = true;
                    return;
                }
                // else {
                //     // Clear the selection
                //     board.current.clearSelectedElements();
                //     board.current.activeGroup = null;
                //     forceUpdate();
                // }
            }
            // Check for selection mode
            const insideElements = board.current.elements.filter(element => {
                const [xStart, xEnd] = getAbsolutePositions(element.x, element.width);
                const [yStart, yEnd] = getAbsolutePositions(element.y, element.height);
                // Check if the position is inside the element
                return (xStart <= lastX && lastX <= xEnd) && (yStart <= lastY && lastY <= yEnd);
            });
            if (insideElements.length > 0) {
                element = insideElements[0]; // Get only the first element
                isElementSelected = element.selected; // Save if element has been already selected
                // Check if this element is not selected
                if (element.selected === false && !nativeEvent.shiftKey) {
                    board.current.clearSelectedElements();
                }
                // Add elements of this group
                if (!board.current.activeGroup && element.group) {
                    // board.current.selectAllElementsInGroup(element.group);
                    board.current.elements.forEach(el => el.selected = el.group === element.group || el.selected);
                }
                element.selected = true;
                snapshot = board.current.snapshotSelectedElements();
                dragged = false;
                // const selectionLocked = isSelectionLocked(ctx.current);
            }
            // Render selection element
            else {
                board.current.clearSelectedElements();
                board.current.initSelection(lastX, lastY);
                // Check if we should clear the current group
                if (board.current.activeGroup) {
                    const list = board.current.elements.filter(el => el.group === board.current.activeGroup);
                    const g = getOuterRectangle(list);
                    if (lastX < g.x || g.x + g.width < lastX || lastY < g.y || g.y + g.height < lastY) {
                        board.current.activeGroup = null; // Reset current group
                    }
                }
            }
            pointerMoveActive = true;
        }
        // Screenshot mode
        else if (state.mode === MODES.SCREENSHOT) {
            board.current.initSelection(lastX, lastY);
            board.current.activeElement = null;
            board.current.activeGroup = null;
            board.current.clearSelectedElements();
            pointerMoveActive = true;
        }
        // Creation mode
        else if (state.mode === MODES.NONE) {
            element = createElement({
                type: state.elementType,
                x: getPosition(lastX), 
                y: getPosition(lastY),
            });
            board.current.addElement(element);
            board.current.activeGroup = null; // Reset current group
            board.current.clearSelectedElements();
            pointerMoveActive = true;
        }
        // pointerMoveActive = true; // Enable move
        // draw();
    };

    const handlePointerMove = ({nativeEvent}) => {
        nativeEvent.preventDefault();
        if (!pointerMoveActive) return;
        // const element = board.current.activeElement || null;
        const x = getXCoordinate(nativeEvent.offsetX) - lastX; // event.clientX - event.target.offsetLeft;
        const y = getYCoordinate(nativeEvent.offsetY) - lastY; // event.clientY - event.target.offsetTop;
        if (state.mode === MODES.MOVE) {
            boardX = state.x + x;
            boardY = state.y + y;
            draw();
        }
        else if (state.mode === MODES.SELECTION) {
            if (resize) {
                if (orientation === RESIZE_ORIENTATIONS.RIGHT) {
                    element.width = getPosition(element.x + snapshot.width + x) - element.x;
                }
                else if (orientation === RESIZE_ORIENTATIONS.LEFT) {
                    element.x = getPosition(snapshot.x + x);
                    element.width = snapshot.width + (snapshot.x - element.x);
                }
                else if (orientation === RESIZE_ORIENTATIONS.BOTTOM) {
                    element.height = getPosition(element.y + snapshot.height + y) - element.y;
                }
                else if (orientation === RESIZE_ORIENTATIONS.TOP) {
                    element.y = getPosition(snapshot.y + y);
                    element.height = snapshot.height + (snapshot.y - element.y);
                }
                else if (orientation === RESIZE_ORIENTATIONS.LEFT_TOP) {
                    element.x = getPosition(snapshot.x + x);
                    element.y = getPosition(snapshot.y + y);
                    element.width = snapshot.width + (snapshot.x - element.x);
                    element.height = snapshot.height + (snapshot.y - element.y);
                }
                else if (orientation === RESIZE_ORIENTATIONS.RIGHT_TOP) {
                    element.y = getPosition(snapshot.y + y);
                    element.height = snapshot.height + (snapshot.y - element.y);
                    element.width = getPosition(element.x + snapshot.width + x) - element.x;
                }
                else if (orientation === RESIZE_ORIENTATIONS.LEFT_BOTTOM) {
                    element.x = getPosition(snapshot.x + x);
                    element.width = snapshot.width + (snapshot.x - element.x);
                    element.height = getPosition(element.y + snapshot.height + y) - element.y;
                }
                else if (orientation === RESIZE_ORIENTATIONS.RIGHT_BOTTOM) {
                    element.width = getPosition(element.x + snapshot.width + x) - element.x;
                    element.height = getPosition(element.y + snapshot.height + y) - element.y;
                }
            }
            else if (element) {
                dragged = true; // Mark as dragged eleemnt
                board.current.getSelectedElements().forEach((el, index) => {
                    el.x = getPosition(snapshot[index].x + x);
                    el.y = getPosition(snapshot[index].y + y);
                });
            }
            else if (board.current.selection) {
                board.current.updateSelection(x, y);
                board.current.applySelection();
            }
            draw();
        }
        // Screenshot mode
        else if (state.mode === MODES.SCREENSHOT) {
            board.current.updateSelection(x, y);
            draw();
        }
        // Create a new element mode
        else if (state.mode === MODES.NONE && element) {
            if (element.type !== ELEMENT_TYPES.TEXT) {
                element.width = getPosition(x);
                element.height = nativeEvent.shiftKey ? getPosition(x) : getPosition(y);
                draw();
            }
            else {
                element.x = getPosition(getXCoordinate(nativeEvent.offsetY));
                element.y = getPosition(getYCoordinate(nativeEvent.offsetY));
            }
        }
    };

    const handlePointerUp = ({nativeEvent}) => {
        nativeEvent.preventDefault();
        pointerMoveActive = false; // Disable move listener
        if (state.mode === MODES.MOVE) {
            setState(prevState => ({
                ...prevState,
                x: boardX,
                y: boardY,
            }));
        }
        else if (state.mode === MODES.SELECTION) {
            if (resize || dragged) {
                const keys = dragged ? ["x", "y"] : ["x", "y", "width", "height"];
                board.current.addHistoryEntry({
                    type: ELEMENT_CHANGE_TYPES.UPDATE,
                    elements: board.current.getSelectedElements().map((el, index) => ({
                        id: el.id,
                        prevValues: Object.fromEntries(keys.map(key => [key, dragged ? snapshot[index][key] : snapshot[key]])),
                        newValues: Object.fromEntries(keys.map(key => [key, el[key]])),
                    })),
                });
                resize = false;
                dragged = false;
            }
            else {
                if (element && !dragged) {
                    if (isElementSelected === true && nativeEvent.shiftKey) {
                        element.selected = false;
                    }
                    // Check if no shift key is pressed --> keep only this current element in selection
                    else if (!nativeEvent.shiftKey) {
                        board.current.clearSelectedElements();
                        element.selected = true;
                    }
                    // Check if this elements is part of a group
                    // This will disable the shift action if the element is in a group
                    if (element.group && !board.current.activeGroup) {
                        // board.current.selectAllElementsInGroup(element.group);
                        board.current.elements.forEach(el => el.selected = el.group === element.group || el.selected);
                    }
                }
                dragged = false;
                board.current.clearSelection();
            }
            forceUpdate();
        }
        // Screenshot mode (TODO)
        else if (state.mode === MODES.SCREENSHOT) {
            const options = {
                translateX: state.x,
                translateY: state.y,
                region: normalizeRegion(board.current.selection),
            };
            board.current.clearSelection();
            draw(); // Prevent screenshot rectangle in captured image
            screenshotCanvas(boardRef.current, options).then(blob => {
                props.onScreenshot && props.onScreenshot(blob);
            });
            return setState(prevState => ({
                ...prevState,
                mode: MODES.SELECTION,
            }));
        }
        // Element creation mode
        else if (state.mode === MODES.NONE && element) {
            element.selected = true; // Set element as selected
            updateElement(element, ["selected"]);
            // board.current.activeElement = element;
            board.current.registerElementCreate(element);
            setState(prevState => ({
                ...prevState,
                mode: MODES.SELECTION,
            }));
        }
        element = null; // Disabled selected element
        draw();
    };

    const handleDoubleClick = ({nativeEvent}) => {
        nativeEvent.preventDefault();
        if (state.mode === MODES.MOVE) return; // Disable double click on move
        const selection = board.current.getSelectedElements();
        // Check if all selected elements are in a group
        if (selection.length > 0 && !board.current.activeGroup) {
            const group = selection[0].group;
            const sameGroup = selection.every(el => el.group === group);
            if (group && sameGroup) {
                board.current.clearSelectedElements();
                board.current.activeGroup = group;
                draw();
                return forceUpdate();
            }
        }
        if (selection.length === 1 && typeof selection[0].textContent === "string") {
            board.current.activeElement = selection[0];
        }
        else {
            board.current.activeElement = createElement({
                type: ELEMENT_TYPES.TEXT,
                x: getPosition(getXCoordinate(nativeEvent.clientX)),
                y: getPosition(getYCoordinate(nativeEvent.clientY)),
            });
            board.current.addElement(board.current.activeElement);
            board.current.registerElementCreate(board.current.activeElement);
        }
        board.current.clearSelectedElements();
        setState(prevState => ({
            ...prevState,
            mode: MODES.INPUT,
        }));
    };

    // Init paste listener
    React.useEffect(() => {
        const handlePaste = event => {
            return !isInputTarget(event) && getDataFromClipboard(event).then(data => {
                board.current.clearSelectedElements();
                board.current.activeGroup = null;
                parseClipboardBlob(data.type, data.blob).then(content => {
                    if (data.type !== "image") {
                        const element = createElement({
                            type: ELEMENT_TYPES.TEXT,
                            textContent: content,
                        });
                        updateElement(element, ["textContent"]);
                        Object.assign(element, {
                            selected: true, // Set element as selected
                            x: getPosition(getXCoordinate((state.width - element.width) / 2)),
                            y: getPosition(getYCoordinate((state.height - element.height) / 2)), 
                        });
                        board.current.addElement(element);
                        board.current.registerElementCreate(element);
                        draw();
                        return setState(prevState => ({
                            ...prevState,
                            mode: MODES.SELECTION,
                        }));
                    }
                    // Load as a new image
                    createImage(content).then(img => {
                        const element = createElement({
                            type: ELEMENT_TYPES.IMAGE,
                            width: img.width,
                            height: img.height,
                            img: img,
                        });
                        updateElement(element, ["img", "width", "height"]);
                        Object.assign(element, {
                            selected: true, // Set element as selected
                            x: getPosition(getXCoordinate((state.width - element.width) / 2)),
                            y: getPosition(getYCoordinate((state.height - element.height) / 2)), 
                        });
                        board.current.addElement(element);
                        board.current.registerElementCreate(element);
                        draw();
                        return setState(prevState => ({
                            ...prevState,
                            mode: MODES.SELECTION,
                        }));
                    });
                });
            });
        };
        document.addEventListener(EVENTS.PASTE, handlePaste, false);
        return () => {
            document.removeEventListener(EVENTS.PASTE, handlePaste, false);
        };
    }, [state.x, state.y, state.width, state.height]);

    // Resize event listener
    React.useEffect(() => {
        const handleResize = () => {
            return setState(prevState => ({
                ...prevState,
                width: parentRef.current.offsetWidth,
                height: parentRef.current.offsetHeight,
            }));
        };
        // Resize the board for the first time
        handleResize();
        window.addEventListener(EVENTS.RESIZE, handleResize, false);
        return () => {
            window.removeEventListener(EVENTS.RESIZE, handleResize, false);
        };
    }, []);

    // Effect for keydown event
    React.useEffect(() => {
        const handleKeyDown = event => {
            if (state.mode === MODES.INPUT || isInputTarget(event)) {
                if (state.mode === MODES.INPUT && event.key === KEYS.ESCAPE) {
                    event.preventDefault();
                    submitInput();
                    draw();
                }
            }
            // Check ESCAPE key --> reset selection
            else if (event.key === KEYS.ESCAPE) {
                event.preventDefault();
                board.current.clearSelectedElements();
                board.current.activeGroup = null;
                draw();
                forceUpdate();
            }
            // Check for backspace key --> remove elements
            else if (event.key === KEYS.BACKSPACE) {
                event.preventDefault();
                board.current.registerSelectionRemove();
                board.current.removeSelectedElements();
                draw();
                forceUpdate();
            }
            // Check for arrow keys --> move elements
            else if (isArrowKey(event.key)) {
                event.preventDefault();
                const step = state.gridEnabled ? state.gridSize : (event.shiftKey ? 5 : 1);
                const direction = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                const selectedElements = board.current.getSelectedElements();
                board.current.addHistoryEntry({
                    type: ELEMENT_CHANGE_TYPES.UPDATE,
                    ids: selectedElements.map(el => el.id).join(","),
                    keys: direction,
                    elements: selectedElements.map(el => {
                        const prevValue = el[direction];
                        el[direction] = prevValue + step * sign;
                        return {
                            id: el.id,
                            prevValues: {[direction]: prevValue},
                            newValues: {[direction]: el[direction]},
                        };
                    }),
                });
                draw();
                // forceUpdate();
            }
        };
        // Register document event listeners
        document.addEventListener(EVENTS.KEY_DOWN, handleKeyDown, false);
        return () => {
            document.removeEventListener(EVENTS.KEY_DOWN, handleKeyDown, false);
        };
    }, [state.mode, state.gridEnabled, state.gridSize]);

    // Listen to inputVisible changes
    React.useEffect(() => {
        if (state.mode !== MODES.INPUT || !inputRef.current) {
            return;
        }
        const el = board.current.activeElement;
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
        inputRef.current.style.top = (state.y + el.y) + "px";
        inputRef.current.style.left = (state.x + el.x) + "px";
        inputRef.current.style.color = el.textColor;
        inputRef.current.style.fontSize = el.textSize + "px";
        inputRef.current.style.fontFamily = el.textFont;
        inputRef.current.style.textAlign = el.textAlign;
        inputRef.current.value = el.textContent || ""; // Get text content
        inputRef.current.focus(); // focus in the new input
        updateInput();

        inputRef.current.addEventListener("input", () => updateInput());
        inputRef.current.addEventListener("mousedown", e => e.stopPropagation());
        inputRef.current.addEventListener("mouseup", e => e.stopPropagation());
    }, [state.mode]);

    // Drawing effects
    React.useEffect(() => draw(), [state.mode, state.width, state.height]);
    React.useEffect(() => {
        state.gridEnabled && drawGrid(gridRef.current, {
            translateX: state.x,
            translateY: state.y,
            width: state.width,
            height: state.height,
            size: state.gridSize,
            color: state.gridColor,
            opacity: state.gridOpacity,
        });
    }, [
        state.gridEnabled, state.gridColor, state.gridOpacity, state.gridSize,
        state.width, state.height,
        state.x, state.y,
    ]);

    // Add API
    React.useEffect(() => {
        apiRef.current = {};
    }, []);

    return (
        <div className="is-relative has-w-full has-h-full" ref={parentRef}>
            {/* Grid canvas */}
            {state.gridEnabled && (
                <Canvas
                    ref={gridRef}
                    width={state.width}
                    height={state.height}
                />
            )}
            {/* Main board canvas */}
            <Canvas
                ref={boardRef}
                width={state.width}
                height={state.height}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={handleDoubleClick}
                style={{
                    cursor: state.mode === MODES.MOVE ? "move": "",
                }}
            />
            <Menubar
                options={state}
                gridEnabled={state.gridEnabled}
                cameraEnabled={state.mode === MODES.SCREENSHOT}
                onGridClick={() => {
                    setState(prevState => ({
                        ...prevState,
                        gridEnabled: !prevState.gridEnabled,
                    }));
                }}
                onCameraClick={() => {
                    setState(prevState => ({
                        ...prevState,
                        mode: prevState.mode === MODES.SCREENSHOT ? MODES.SELECTION : MODES.SCREENSHOT,
                    }));
                }}
                onOptionsChange={(name, value) => {
                    setState(prevState => ({...prevState, [name]: value}));
                }}
            />
            {state.mode !== MODES.SCREENSHOT && (
                <React.Fragment>
                    <Toolbar
                        type={state.elementType}
                        mode={state.mode}
                        onTypeChange={type => {
                            board.current.clearSelectedElements();
                            setState(prevState => ({
                                ...prevState,
                                elementType: type,
                                mode: MODES.NONE,
                            }));
                        }}
                        onModeChange={mode => {
                            board.current.clearSelectedElements();
                            setState(prevState => ({...prevState, mode: mode}));
                        }}
                    />
                    <Stylebar
                        key={state.mode + state.elementType + updateKey}
                        selection={board.current.getSelectedElements()}
                        activeGroup={board.current.activeGroup}
                        onChange={(key, value) => {
                            board.current.registerSelectionUpdate([key], [value], true);
                            board.current.updateSelectedElements(key, value);
                            draw();
                        }}
                        onRemoveClick={() => {
                            board.current.registerSelectionRemove();
                            board.current.removeSelectedElements();
                            draw();
                            forceUpdate();
                        }}
                        onBringForwardClick={() => {
                            // boardApi.current.bringSelectionForward();
                        }}
                        onSendBackwardClick={() => {
                            // boardApi.current.sendSelectionBackward();
                        }}
                        onGroupSelectionClick={() => {
                            const group = generateID();
                            board.current.registerSelectionUpdate(["group"], [group], false);
                            board.current.updateSelectedElements("group", group);
                            draw();
                            forceUpdate();
                        }}
                        onUngroupSelectionClick={() => {
                            board.current.registerSelectionUpdate(["group"], [null], false);
                            board.current.updateSelectedElements("group", null);
                            draw();
                            forceUpdate();
                        }}
                    />
                    <Historybar
                        undoDisabled={board.current.isUndoDisabled()}
                        redoDisabled={board.current.isRedoDisabled()}
                        onUndoClick={() => {
                            board.current.undo();
                            draw();
                            forceUpdate();
                        }}
                        onRedoClick={() => {
                            board.current.redo();
                            draw();
                            forceUpdate();
                        }}
                    />
                </React.Fragment>
            )}
            {state.mode === MODES.INPUT && (
                <TextInput visible={true} ref={inputRef} />
            )}
        </div>
    );
});

Folio.defaultProps = {
    background: "#fff",
    gridEnabled: false,
    gridColor: DEFAULT_GRID_COLOR,
    gridOpacity: DEFAULT_GRID_OPACITY,
    gridSize: DEFAULT_GRID_SIZE,
    gridStyle: DEFAULT_GRID_STYLE,
    onChange: null,
    onScreenshot: null,
};
