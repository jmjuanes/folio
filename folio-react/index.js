import React from "react";

import {
    IS_DARWIN,
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
    ZOOM_INITIAL,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_STEP,
    MIME_TYPES,
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
    sign,
    getAbsolutePositions,
    getOuterRectangle,
    normalizeRegion,
} from "./utils/math.js";
import {
    parseClipboardBlob,
    getDataFromClipboard,
    copyTextToClipboard,
} from "./utils/clipboard.js";
import {screenshotCanvas, clearCanvas} from "./utils/canvas.js";
import {downloadFile, readFile} from "./utils/file.js";
import {
    blobFromFile,
    blobToClipboard,
    blobToFile,
    createBlob,
} from "./utils/blob.js";
import {createBoard} from "./board.js";
import {drawBoard, drawGrid} from "./draw.js";
import {serializeAsJson, parseFromJson, exportState} from "./data.js";
import {exportToBlob} from "./export.js";
import {css} from "./styles.js";

import {Menubar} from "./components/Menubar.js";
import {Stylebar} from "./components/Stylebar.js";
import {Toolbar} from "./components/Toolbar.js";
import {Historybar} from "./components/Historybar.js";
import {TextInput} from "./components/TextInput.js";
import {Canvas} from "./components/Canvas.js";
import {Zoom} from "./components/Zoom.js";
import {Screenshot} from "./components/Screenshot.js";
import {WelcomeDialog} from "./components/Welcome.js";
import {ExportDialog} from "./components/Export.js";

// Check for arrow keys
const isArrowKey = key => {
    return key === KEYS.ARROW_DOWN || key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT || key === KEYS.ARROW_UP;
};

// Check if the provided event.target is related to an input element
const isInputTarget = e => {
    return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
};

// Main container styles
const rootClassName = css({
    height: "100%",
    overflow: "hidden",
    position: "relative",
    width: "100%",
    apply: "mixins.root",
});

export const Folio = props => {
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
        pasteIndex: 0,
        zoom: ZOOM_INITIAL,
        showSreenshotDialog: false,
        showExportDialog: false,
        showWelcomeDialog: props.showWelcome,
        gridEnabled: false,
        gridColor: DEFAULT_GRID_COLOR,
        gridOpacity: DEFAULT_GRID_OPACITY,
        gridSize: DEFAULT_GRID_SIZE,
        backgroundColor: "#fff",
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
    let scale = 1;

    // Initialize board API reference
    if (!board.current) {
        board.current = createBoard();
    }

    // Calculate the position using the grid size
    const getPosition = v => {
        return state.gridEnabled ? Math.round(v / state.gridSize) * state.gridSize : v;
    };

    // Get coordinates in the board
    const getXCoordinate = x => (x - state.x) / state.zoom;
    const getYCoordinate = y => (y - state.y) / state.zoom;

    // Handle zoom change
    const handleZoomChange = delta => {
        return setState(prevState => {
            const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prevState.zoom + delta));
            return {
                ...prevState,
                zoom: newZoom,
                x: prevState.x + prevState.width * (prevState.zoom - newZoom) / 2,
                y: prevState.y + prevState.height * (prevState.zoom - newZoom) / 2,
            };
        });
    };

    // Draw the board
    const draw = () => {
        drawBoard(boardRef.current, board.current.elements, board.current.selection, {
            clear: true,
            translateX: boardX,
            translateY: boardY,
            mode: state.mode,
            drawActiveInnerText: state.mode !== MODES.INPUT,
            activeElement: board.current.activeElement,
            activeGroup: board.current.activeGroup,
            pointerMoveActive: pointerMoveActive,
            zoom: state.zoom,
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

    // Take screenshot
    const takeScreenshot = region => {
        const options = {
            translateX: state.x,
            translateY: state.y,
            region: normalizeRegion(region),
        };
        screenshotCanvas(boardRef.current, options).then(blob => {
            if (typeof props.onScreenshot === "function") {
                return props.onScreenshot(blob, options);
            }
            // Copy screenshot to clipboard
            blobToClipboard(blob);
            // TODO: show notification
        });
    };

    // Handle load click
    const handleLoadClick = () => {
        if (typeof props.onLoad === "function") {
            return props.onLoad();
        }
        // Load from local file
        return readFile(".folio")
            .then(file => blobFromFile(file, MIME_TYPES.JSON))
            .then(blob => blob.text())
            .then(str => parseFromJson(str))
            .then(data => handleLoad(data))
            .catch(error => {
                console.error(error);
                // TODO: show notification
            });
    };

    const handleLoad = data => {
        if (data?.elements && Array.isArray(data.elements)) {
            board.current.loadElements(data.elements);
        }
        // TODO: get only specific keys from state
        // TODO: set background image
        setState(prevState => ({
            ...prevState,
            ...(data?.state || {}),
            // backgroundColor: data.backgroundColor,
            // backgroundImage: data.backgroundImage,
            showWelcomeDialog: false,
        }));
        draw();
    };

    const handleSaveClick = () => {
        if (typeof props.onSave === "function") {
            return props.onSave(board.current.exportElements(), exportState(state));
        }
        // Prepare to save drawing
        const opt = {
            elements: board.current.exportElements(),
            state: exportState(state),
        };
        serializeAsJson(opt)
            .then(data => {
                const blob = createBlob(data, MIME_TYPES.JSON);
                return blobToFile(blob, "untitled.folio");
            })
            .then(file => downloadFile(file))
            .catch(error => {
                console.error(error);
            });
    };
    
    const handleExportClick = () => {
        if (typeof props.onExport === "function") {
            return props.onExport(board.current.exportElements(), exportState(state));
        }
        // Display the export dialog
        return setState(prevState => ({
            ...prevState,
            showExportDialog: true,
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
                const radius = 2 * DEFAULT_ELEMENT_RESIZE_RADIUS / state.zoom;
                const offset = DEFAULT_ELEMENT_SELECTION_OFFSET / state.zoom;
                const point = inResizePoint(selection[0], lastX, lastY, radius, offset);
                if (point && !selection[0].locked) {
                    element = selection[0]; // Save current element
                    orientation = fixResizeOrientation(element, point.orientation);
                    snapshot = board.current.snapshotSelectedElements()[0];
                    resize = true;
                    pointerMoveActive = true;
                    scale = Math.abs(snapshot.width / (sign(snapshot.height) * Math.max(0.1, Math.abs(snapshot.height))));
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
            if (state.elementType === ELEMENT_TYPES.HAND_DRAW) {
                element.points.push([0, 0]);
            }
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
            boardX = state.x + x * state.zoom;
            boardY = state.y + y * state.zoom;
            draw();
        }
        else if (state.mode === MODES.SELECTION) {
            const hasShiftKey = nativeEvent.shiftKey;
            if (resize) {
                if (orientation === RESIZE_ORIENTATIONS.RIGHT || orientation === RESIZE_ORIENTATIONS.LEFT) {
                    if (orientation === RESIZE_ORIENTATIONS.RIGHT) {
                        element.width = getPosition(element.x + snapshot.width + x) - element.x;
                    }
                    else {
                        element.x = getPosition(snapshot.x + x);
                        element.width = snapshot.width + (snapshot.x - element.x);
                    }
                    if (hasShiftKey) {
                        const delta = (element.width - snapshot.width) / scale;
                        element.y = snapshot.y - delta / 2;
                        element.height = snapshot.height + delta;
                    }
                }
                else if (orientation === RESIZE_ORIENTATIONS.BOTTOM || orientation === RESIZE_ORIENTATIONS.TOP) {
                    if (orientation === RESIZE_ORIENTATIONS.BOTTOM) {
                        element.height = getPosition(element.y + snapshot.height + y) - element.y;
                    }
                    else {
                        element.y = getPosition(snapshot.y + y);
                        element.height = snapshot.height + (snapshot.y - element.y);
                    }
                    if (hasShiftKey) {
                        const delta = (element.height - snapshot.height) * scale;
                        element.x = snapshot.x - delta / 2;
                        element.width = snapshot.width + delta;
                    }
                }
                else if (orientation === RESIZE_ORIENTATIONS.LEFT_TOP || orientation === RESIZE_ORIENTATIONS.RIGHT_TOP) {
                    if (orientation === RESIZE_ORIENTATIONS.LEFT_TOP) {
                        element.x = getPosition(snapshot.x + x);
                        element.width = snapshot.width + (snapshot.x - element.x);
                    }
                    else {
                        element.width = getPosition(element.x + snapshot.width + x) - element.x;
                    }
                    if (hasShiftKey) {
                        const delta = (snapshot.width - element.width) / scale;
                        element.y = snapshot.y + delta;
                    }
                    else {
                        element.y = getPosition(snapshot.y + y);
                    }
                    element.height = snapshot.height + (snapshot.y - element.y);
                }
                else if (orientation === RESIZE_ORIENTATIONS.RIGHT_BOTTOM || orientation === RESIZE_ORIENTATIONS.LEFT_BOTTOM) {
                    if (orientation === RESIZE_ORIENTATIONS.RIGHT_BOTTOM) {
                        element.width = getPosition(element.x + snapshot.width + x) - element.x;
                    }
                    else {
                        element.x = getPosition(snapshot.x + x);
                        element.width = snapshot.width + (snapshot.x - element.x);
                    }
                    if (hasShiftKey) {
                        const delta = (element.width - snapshot.width) / scale;
                        element.height = snapshot.height + delta;
                    } else {
                        element.height = getPosition(element.y + snapshot.height + y) - element.y;
                    }
                }
            }
            else if (element) {
                dragged = true; // Mark as dragged element
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
            if (element.type === ELEMENT_TYPES.HAND_DRAW) {
                element.points.push([x, y]);
                drawBoard(boardRef.current, [element], null, {
                    clear: false,
                    translateX: boardX,
                    translateY: boardY,
                    zoom: state.zoom,
                });
            }
            else if (element.type !== ELEMENT_TYPES.TEXT) {
                element.width = getPosition(x);
                element.height = nativeEvent.shiftKey ? getPosition(x) : getPosition(y);
                draw();
            }
            else {
                element.x = getPosition(getXCoordinate(nativeEvent.offsetX));
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
            const region = {
                x: board.current.selection.x * state.zoom,
                y: board.current.selection.y * state.zoom,
                width: board.current.selection.width * state.zoom,
                height: board.current.selection.height * state.zoom,
            };
            board.current.clearSelection();
            draw(); // Prevent screenshot rectangle in captured image
            takeScreenshot(region);
            return setState(prevState => ({
                ...prevState,
                mode: MODES.SELECTION,
            }));
        }
        // Element creation mode
        else if (state.mode === MODES.NONE && element) {
            if (element.type === ELEMENT_TYPES.TEXT) {
                board.current.activeElement = element;
                return setState(prevState => ({
                    ...prevState,
                    mode: MODES.INPUT,
                }));
            }
            else if (element.type === ELEMENT_TYPES.HAND_DRAW) {
                if (element.points.length < 2) {
                    board.current.removeElement(element);
                }
                else {
                    updateElement(element, ["points"]);
                    board.current.registerElementCreate(element);
                }
                forceUpdate();
            }
            else {
                element.selected = true; // Set element as selected
                updateElement(element, ["selected"]);
                board.current.registerElementCreate(element);
                setState(prevState => ({
                    ...prevState,
                    mode: MODES.SELECTION,
                }));
            }
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
                x: getPosition(getXCoordinate(nativeEvent.offsetX)),
                y: getPosition(getYCoordinate(nativeEvent.offsetY)),
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
                // board.current.activeGroup = null;
                parseClipboardBlob(data.type, data.blob).then(content => {
                    if (data.type !== "image") {
                        let index = state.pasteIndex;
                        // Check for pasting folio elements
                        if (content.startsWith("folio:::")) {
                            index = index + 1; // Increment paste index
                            const elements = JSON.parse(content.split("folio:::")[1].trim());
                            elements.forEach(el => {
                                el.x = el.x + index * (state.gridEnabled ? state.gridSize : 10);
                                el.y = el.y + index * (state.gridEnabled ? state.gridSize : 10);
                            });
                            board.current.pasteSelectedElements(elements);
                        }
                        // Paste as a new text element
                        else {
                            const element = createElement({
                                type: ELEMENT_TYPES.TEXT,
                                textContent: content,
                            });
                            updateElement(element, ["textContent"]);
                            Object.assign(element, {
                                selected: true, // Set element as selected
                                x: getPosition(getXCoordinate((state.width - element.width) / 2)),
                                y: getPosition(getYCoordinate((state.height - element.height) / 2)), 
                                group: board.current.activeGroup || null,
                            });
                            board.current.addElement(element);
                            board.current.registerElementCreate(element);
                        }
                        draw();
                        return setState(prevState => ({
                            ...prevState,
                            mode: MODES.SELECTION,
                            pasteIndex: index,
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
                            group: board.current.activeGroup || null,
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
    }, [state.x, state.y, state.width, state.height, state.pasteIndex]);

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
                return;
            }
            const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
            if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                event.preventDefault();
                if (event.key === KEYS.X || event.key === KEYS.C) {
                    const elements = board.current.copySelectedElements();
                    copyTextToClipboard(`folio:::${JSON.stringify(elements)}`);
                }
                // Check for backspace key or cut --> remove elements
                if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                    board.current.registerSelectionRemove();
                    board.current.removeSelectedElements();
                    // Reset active group if all elements of this group have been removed
                    if (board.current.getElementsInActiveGroup().length < 1) {
                        board.current.activeGroup = null;
                    }
                    draw();
                }
                setState(prevState => ({
                    ...prevState,
                    pasteIndex: 0,
                }));
            }
            // Undo or redo key
            else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                event.key === KEYS.Z ? board.current.undo() : board.current.redo();
                draw();
                forceUpdate();
            }
            // Check ESCAPE key
            else if (event.key === KEYS.ESCAPE) {
                event.preventDefault();
                // Check if screenshot dialog is visible
                if (state.showSreenshotDialog) {
                    return setState(prevState => ({...prevState, showSreenshotDialog: false}));
                }
                else if (state.showWelcomeDialog) {
                    return setState(prevState => ({...prevState, showWelcomeDialog: false}));
                }
                else if (state.showExportDialog) {
                    return setState(prevState => ({...prevState, showExportDialog: false}));
                }
                // Check if we are in the screenshot mode
                else if (state.mode === MODES.SCREENSHOT) {
                    return setState(prevState => ({
                        ...prevState,
                        mode: MODES.SELECTION,
                    }));
                }
                board.current.clearSelectedElements();
                board.current.activeGroup = null;
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
    }, [
        state.mode,
        state.showSreenshotDialog, state.showWelcomeDialog, state.showExportDialog,
        state.gridEnabled, state.gridSize,
    ]);

    // Listen to inputVisible changes
    React.useEffect(() => {
        if (state.mode !== MODES.INPUT || !inputRef.current) {
            return;
        }
        const el = board.current.activeElement;
        const updateInput = () => {
            inputRef.current.style.height = "1em";
            const size = measureText(inputRef.current.value || "", el.textSize * state.zoom, el.textFont);
            const width = Math.max(size.width + 1, el.width);
            const height = inputRef.current.scrollHeight; // .max(ctx.input.scrollHeight, ctx.currentElement.height);
            inputRef.current.style.width = width;
            inputRef.current.style.height = height;

            // Move text input to the correct position
            if (el.type !== ELEMENT_TYPES.TEXT) {
                // Vertical align
                if (el.textVerticalAlign === TEXT_VERTICAL_ALIGNS.MIDDLE) {
                    inputRef.current.style.top = state.y + (el.y + (el.height - height / state.zoom) / 2) * state.zoom;
                }
                else if (el.textVerticalAlign === TEXT_VERTICAL_ALIGNS.BOTTOM) {
                    inputRef.current.style.top = state.y + (el.y + (el.height - height / state.zoom)) * state.zoom;
                }
                // Horizontal align
                if (el.textAlign === TEXT_ALIGNS.CENTER) {
                    inputRef.current.style.left = state.x + (el.x - ((width / state.zoom) - el.width) / 2) * state.zoom;
                }
                else if (el.textAlign === TEXT_ALIGNS.RIGHT) {
                    inputRef.current.style.left = state.x + (el.x - ((width / state.zoom) - el.width)) * state.zoom;
                }
            }
        };

        // Set input position and initial value
        inputRef.current.style.top = (state.y + el.y * state.zoom) + "px";
        inputRef.current.style.left = (state.x + el.x * state.zoom) + "px";
        inputRef.current.style.color = el.textColor;
        inputRef.current.style.fontSize = (el.textSize * state.zoom) + "px";
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
    React.useEffect(() => draw(), [state.mode, state.width, state.height, state.zoom]);
    React.useEffect(() => {
        state.gridEnabled && drawGrid(gridRef.current, {
            translateX: state.x,
            translateY: state.y,
            width: state.width,
            height: state.height,
            size: state.gridSize,
            color: state.gridColor,
            opacity: state.gridOpacity,
            zoom: state.zoom,
        });
    }, [
        state.gridEnabled,
        state.gridColor, state.gridOpacity, state.gridSize,
        state.width, state.height,
        state.x, state.y,
        state.zoom,
    ]);

    // Initial data loader
    // React.useEffect(() => {
    //     if (props.initialData && typeof props.initialData === "object") {
    //         handleLoad(props.initialData);
    //     }
    // }, []);

    return (
        <div className={rootClassName} ref={parentRef}>
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
                mode={state.mode}
                options={state}
                onCameraClick={() => {
                    if (state.mode === MODES.SCREENSHOT) {
                        return setState(prevState => ({
                            ...prevState,
                            mode: MODES.SELECTION,
                        }));
                    }
                    return setState(prevState => ({
                        ...prevState,
                        showSreenshotDialog: true,
                    }));
                }}
                onExportClick={() => handleExportClick()}
                onSaveClick={() => handleSaveClick()}
                onOptionsChange={(name, value) => {
                    setState(prevState => ({
                        ...prevState,
                        [name]: value,
                    }));
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
                    <Zoom
                        zoom={state.zoom}
                        zoomInDisabled={state.zoom >= ZOOM_MAX}
                        zoomOutDisabled={state.zoom <= ZOOM_MIN}
                        onZoomInClick={() => handleZoomChange(ZOOM_STEP)}
                        onZoomOutClick={() => handleZoomChange(-ZOOM_STEP)}
                    />
                </React.Fragment>
            )}
            {state.mode === MODES.INPUT && (
                <TextInput visible={true} ref={inputRef} />
            )}
            {state.showSreenshotDialog && (
                <Screenshot
                    onFullClick={() => {
                        takeScreenshot({
                            x: 0,
                            y: 0,
                            width: state.width * state.zoom,
                            height: state.height * state.zoom,
                        });
                        setState(prevState => ({
                            ...prevState,
                            showSreenshotDialog: false,
                        }));
                    }}
                    onRegionClick={() => {
                        setState(prevState => ({
                            ...prevState,
                            mode: MODES.SCREENSHOT,
                            showSreenshotDialog: false,
                        }));
                    }}
                />
            )}
            {state.showWelcomeDialog && (
                <WelcomeDialog
                    onDismissClick={() => {
                        setState(prevState => ({...prevState, showWelcomeDialog: false}));
                    }}
                    onLoadClick={() => handleLoadClick()}
                />
            )}
            {state.showExportDialog && (
                <ExportDialog
                    onExport={exportOptions => {
                        setState(prevState => ({...prevState, showExportDialog: false}));
                        const filename = exportOptions.filename || "untitled.png";
                        const opt = {
                            elements: exportOptions.onlySelection ? board.current.exportSelectedElements() : board.current.exportElements(),
                            backgroundColor: exportOptions.includeBackground ? state.backgroundColor : null,
                        };
                        // TODO: check for empty elements to export
                        exportToBlob(opt)
                            .then(blob => blobToFile(blob, filename, MIME_TYPES.PNG))
                            .then(file => downloadFile(file))
                            .catch(error => {
                                console.error(error);
                            });

                    }}
                />
            )}
        </div>
    );
};

Folio.defaultProps = {
    //initialData: null,
    showWelcome: true,
    onChange: null,
    onScreenshot: null,
    onExport: null,
    onLoad: null,
    onSave: null,
};
