import React from "react";
import {
    Renderer,
    HANDLERS,
    normalizeRectangle,
    pointInRectangle,
    measureText,
    toImagePNG,
} from "folio-core";

import {
    IS_DARWIN,
    ACTIONS,
    EVENTS,
    KEYS,
    ELEMENT_CHANGE_TYPES,
    ZOOM_STEP,
    ZOOM_MIN,
    ZOOM_MAX,
    SCREENSHOT_FILL_COLOR,
    SCREENSHOT_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
} from "./constants.js";
import {useBoard} from "./hooks/useBoard.js";
import {useBoardState} from "./hooks/useBoardState.js";
import {
    EditionPanel,
    HistoryPanel,
    MenuPanel,
    ToolsPanel,
    ZoomPanel,
} from "./components/Panels/index.jsx";
import {
    StyleDialog,
} from "./components/Dialogs/index.jsx";
import {TextInput} from "./components/TextInput.jsx";
import {
    generateID,
    isArrowKey,
    isInputTarget,
} from "./utils/index.js";

export const Board = props => {
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const ref = React.useRef(null);
    const inputRef = React.useRef(null);
    const board = useBoard([]);
    const state = useBoardState();

    // Calculate the position using the grid size
    const getPosition = v => {
        return props.grid ? Math.round(v / props.gridSize) * props.gridSize : v;
    };

    const submitInput = () => {
        if (state.current.action === ACTIONS.EDIT_ELEMENT && state.current.activeElement) {
            const value = inputRef.current.value || "";
            const element = state.current.activeElement;
            element.selected = true;
            element.editing = false;
            if (element.text !== value) {
                board.current.registerSelectionUpdate(["text"], [value], false);
                element.text = value;
            }
            state.current.activeElement = null;
            state.current.action = null;
            inputRef.current.blur();
        }
        // forceUpdate();
    };

    const cancelInput = () => {
        if (state.current.action === ACTIONS.EDIT_ELEMENT && state.current.activeElement) {
            state.current.activeElement.selected = true;
            state.current.activeElement.editing = false;
            state.current.activeElement = null;
            state.current.action = null;
            inputRef.current.blur();
        }
    };

    // Handle canvas point --> reset current selection
    const handlePointCanvas = () => {
        if (!state.current.tool) {
            board.current.clearSelectedElements();
            forceUpdate();
        }
    };

    // Handle point element
    const handlePointElement = event => {
        if (!state.current.tool && !state.current.action) {
            const element = board.current.getElementById(event.element);
            if (!event.shiftKey) {
                board.current.clearSelectedElements();
                element.selected = true;
            }
            else {
                // Toggle element selection
                element.selected = !element.selected;
            }
            forceUpdate();
        }
    };

    // Handle point handler
    const handlePointHandler = event => {
        state.current.action = ACTIONS.RESIZE_ELEMENT,
        state.current.activeHandler = event.handler;
    };

    const handlePointerDown = event => {
        if (state.current.action === ACTIONS.EDIT_ELEMENT) {
            submitInput();
        }
        if (state.current.tool) {
            state.current.action = ACTIONS.CREATE_ELEMENT;
            const element = {
                id: generateID(),
                type: state.current.tool,
                x: getPosition(event.originalX),
                y: getPosition(event.originalY),
                selected: false,
                locked: false,
                editing: false,
            };
            Object.assign(element, props.tools[state.current.tool]?.onCreateStart?.(element, event, state.current.defaults, getPosition));
            state.current.activeElement = element; // Save element reference
            board.current.addElement(element);
            // board.current.activeGroup = null; // Reset current group
            board.current.clearSelectedElements();
        }
        else if (board.current.getSelectedElements().length > 0) {
            if (!state.current.action) {
                state.current.action = ACTIONS.DRAG_ELEMENT;
            }
            state.current.snapshot = board.current.snapshotSelectedElements();
            state.current.isResized = false;
            state.current.isDragged = false;
        }
        else if (state.current.action === ACTIONS.MOVE) {
            // We need to update the last translated point before start moving the board
            state.current.translate.lastX = state.current.translate.x;
            state.current.translate.lastY = state.current.translate.y;
        }
        else if (!state.current.action || state.current.action === ACTIONS.SCREENSHOT) {
            state.current.action = state.current.action || ACTIONS.SELECTION;
            state.current.brush.x = event.originalX;
            state.current.brush.y = event.originalY;
        }
        forceUpdate();
    };

    const handlePointerMove = event => {
        if (state.current.action === ACTIONS.MOVE) {
            state.current.translate.x = Math.floor(state.current.translate.lastX + event.dx * state.current.zoom);
            state.current.translate.y = Math.floor(state.current.translate.lastY + event.dy * state.current.zoom);
        }
        else if (state.current.action === ACTIONS.CREATE_ELEMENT) {
            Object.assign(
                state.current.activeElement,
                props.tools[state.current.tool]?.onCreateMove?.(state.current.activeElement, event, getPosition),
            );
        }
        else if (state.current.action === ACTIONS.DRAG_ELEMENT) {
            const snapshot = state.current.snapshot;
            state.current.isDragged = true;
            board.current.getSelectedElements().forEach((element, index) => {
                Object.assign(element, props.tools[element.type]?.onDrag?.(snapshot[index], event, getPosition) || {});
            });
        }
        else if (state.current.action === ACTIONS.RESIZE_ELEMENT) {
            const snapshot = state.current.snapshot[0];
            const element = board.current.getElementById(snapshot.id);
            state.current.isResized = true;
            if (state.current.activeHandler === HANDLERS.CORNER_TOP_LEFT) {
                element.x = Math.min(getPosition(snapshot.x + event.dx), snapshot.x + snapshot.width - 1);
                element.width = snapshot.width + (snapshot.x - element.x);
                element.y = Math.min(getPosition(snapshot.y + event.dy), snapshot.y + snapshot.height - 1);
                element.height = snapshot.height + (snapshot.y - element.y);
            }
            else if (state.current.activeHandler === HANDLERS.CORNER_TOP_RIGHT) {
                element.width = Math.max(getPosition(snapshot.x + snapshot.width + event.dx) - snapshot.x, 1);
                element.y = Math.min(getPosition(snapshot.y + event.dy), snapshot.y + snapshot.height - 1);
                element.height = snapshot.height + (snapshot.y - element.y);
            }
            else if (state.current.activeHandler === HANDLERS.CORNER_BOTTOM_LEFT) {
                element.x = Math.min(getPosition(snapshot.x + event.dx), snapshot.x + snapshot.width - 1);
                element.width = snapshot.width + (snapshot.x - element.x);
                element.height = Math.max(getPosition(snapshot.y + snapshot.height + event.dy) - snapshot.y, 1);
            }
            else if (state.current.activeHandler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                element.width = Math.max(getPosition(snapshot.x + snapshot.width + event.dx) - snapshot.x, 1);
                element.height = Math.max(getPosition(snapshot.y + snapshot.height + event.dy) - snapshot.y, 1);
            }
            else if (state.current.activeHandler === HANDLERS.EDGE_TOP) {
                element.y = Math.min(getPosition(snapshot.y + event.dy), snapshot.y + snapshot.height - 1);
                element.height = snapshot.height + (snapshot.y - element.y);
            }
            else if (state.current.activeHandler === HANDLERS.EDGE_BOTTOM) {
                element.height = Math.max(getPosition(snapshot.y + snapshot.height + event.dy) - snapshot.y, 1);
            }
            else if (state.current.activeHandler === HANDLERS.EDGE_LEFT) {
                element.x = Math.min(getPosition(snapshot.x + event.dx), snapshot.x + snapshot.width - 1);
                element.width = snapshot.width + (snapshot.x - element.x);
            }
            else if (state.current.activeHandler === HANDLERS.EDGE_RIGHT) {
                element.width = Math.max(getPosition(snapshot.x + snapshot.width + event.dx) - snapshot.x, 1);
            }
            else if (state.current.activeHandler === HANDLERS.POINT_START) {
                element.x = getPosition(snapshot.x + event.dx);
                element.y = getPosition(snapshot.y + event.dy);
            }
            else if (state.current.activeHandler === HANDLERS.POINT_END) {
                element.x2 = getPosition(snapshot.x2 + event.dx);
                element.y2 = getPosition(snapshot.y2 + event.dy);
            }
        }
        else if (state.current.action === ACTIONS.SELECTION || state.current.action === ACTIONS.SCREENSHOT) {
            state.current.brush.width = event.dx;
            state.current.brush.height = event.dy;
        }
        forceUpdate();
    };

    const handlePointerUp = () => {
        if (state.current.action === ACTIONS.MOVE) {
            // Save the last translation point
            state.current.translate.lastX = state.current.translate.x;
            state.current.translate.lastY = state.current.translate.y;
        }
        else if (state.current.action === ACTIONS.CREATE_ELEMENT) {
            state.current.activeElement.selected = true;
            // updateElement(element, ["selected"]);
            board.current.registerElementCreate(state.current.activeElement);
            state.current.activeElement = null;
            state.current.tool = null; // reset active tool
            state.current.action = null;
        }
        else if (state.current.action === ACTIONS.DRAG_ELEMENT || state.current.action === ACTIONS.RESIZE_ELEMENT) {
            if (state.current.isDragged || state.current.isResized) {
                const snapshot = state.current.snapshot;
                const keys = state.current.isDragged ? ["x", "y"] : ["x", "y", "width", "height"];
                board.current.addHistoryEntry({
                    type: ELEMENT_CHANGE_TYPES.UPDATE,
                    elements: board.current.getSelectedElements().map((el, index) => ({
                        id: el.id,
                        prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                        newValues: Object.fromEntries(keys.map(key => [key, el[key]])),
                    })),
                });
            }
            state.current.isDragged = false;
            state.current.isResized = false;
            state.current.action = null;
        }
        else if (state.current.action === ACTIONS.SELECTION) {
            const rectangle = normalizeRectangle(state.current.brush);
            // Select all elements that are in the selected rectangle
            board.current.getElements().forEach(element => {
                const points = props.tools[element.type]?.getBoundaryPoints(element) || [];
                element.selected = points.some(point => {
                    return pointInRectangle(point, rectangle);
                });
            });
            state.current.action = null;
        }
        else if (state.current.action === ACTIONS.SCREENSHOT) {
            const screenshotOptions = {
                includeBackground: false,
                region: state.current.brush,
            };
            toImagePNG(ref.current, props.width, props.height, screenshotOptions).then(image => {
                props.onScreenshot?.(image);
                // navigator.clipboard.write([
                //     new ClipboardItem({
                //         [image.type]: image,
                //     }),
                // ]);
            });
            state.current.action = null;
        }
        // Reset current state
        // state.current.action = null;
        state.current.brush.width = 0;
        state.current.brush.height = 0;
        forceUpdate();
    };

    // Handle double click
    const handleDoubleClick = () => {
        if (!state.current.action && !state.current.tool) {
            const selection = board.current.getSelectedElements();
            if (selection.length === 1 && typeof selection[0].text === "string") {
                state.current.action = ACTIONS.EDIT_ELEMENT;
                state.current.activeElement = selection[0];
                state.current.activeElement.editing = true;

                return forceUpdate();
            }
        }
    };

    // Key down listener
    React.useEffect(() => {
        const handleKeyDown = event => {
            const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
            // Check if we are in an input target and input element is active
            if (isInputTarget(event)) {
                if (state.current.action === ACTIONS.EDIT_ELEMENT && event.key === KEYS.ESCAPE) {
                    event.preventDefault();
                    submitInput();
                    forceUpdate();
                }
            }
            else if (event.key === KEYS.BACKSPACE || (isCtrlKey && (event.key === KEYS.C || event.key === KEYS.X))) {
                event.preventDefault();
                if (event.key === KEYS.X || event.key === KEYS.C) {
                    const elements = board.current.copySelectedElements();
                    // copyTextToClipboard(`folio:::${JSON.stringify(elements)}`);
                }
                // Check for backspace key or cut --> remove elements
                if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                    board.current.registerSelectionRemove();
                    board.current.removeSelectedElements();
                    // Reset active group if all elements of this group have been removed
                    // if (board.current.getElementsInActiveGroup().length < 1) {
                    //     board.current.activeGroup = null;
                    // }
                }
                forceUpdate();
            }
            // Undo or redo key
            else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                event.key === KEYS.Z ? board.current.undo() : board.current.redo();
                forceUpdate();
            }
            // Check ESCAPE key
            else if (event.key === KEYS.ESCAPE) {
                event.preventDefault();
                board.current.clearSelectedElements();
                if (state.current.action === ACTIONS.SCREENSHOT) {
                    state.current.action = null;
                }
                // board.current.activeGroup = null;
                forceUpdate();
            }
            // Check for arrow keys --> move elements
            else if (isArrowKey(event.key)) {
                event.preventDefault();
                // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                const direction = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                const selectedElements = board.current.getSelectedElements();
                board.current.addHistoryEntry({
                    type: ELEMENT_CHANGE_TYPES.UPDATE,
                    ids: selectedElements.map(el => el.id).join(","),
                    keys: direction,
                    elements: selectedElements.map(el => {
                        const prevValue = el[direction];
                        el[direction] = event.shiftKey ? getPosition(prevValue + sign * (props.gridSize || 10)) : prevValue + sign;
                        return {
                            id: el.id,
                            prevValues: {[direction]: prevValue},
                            newValues: {[direction]: el[direction]},
                        };
                    }),
                });
                forceUpdate();
            }
        };

        document.addEventListener(EVENTS.KEY_DOWN, handleKeyDown);

        // When the board is unmounted, remove keydown event listener
        return () => {
            document.removeEventListener(EVENTS.KEY_DOWN, handleKeyDown);
        };
    }, []);

    // Listen to current action
    React.useEffect(() => {
        if (state.current.action !== ACTIONS.EDIT_ELEMENT || !inputRef.current) {
            return;
        }
        const element = state.current.activeElement;
        const updateInput = () => {
            inputRef.current.style.height = "1em";
            const [width, height] = measureText(
                inputRef.current.value || "",
                element.textSize * state.current.zoom,
                element.textFont,
            );
            // const width = Math.max(size.width + 1, element.width);
            // const height = size.height; // inputRef.current.scrollHeight; // .max(ctx.input.scrollHeight, ctx.currentElement.height);
            inputRef.current.style.width = width + "px";
            inputRef.current.style.height = height + "px";

            // Move text input to the correct position
            // if (el.type !== ELEMENT_TYPES.TEXT) {
            //     // Vertical align
            //     if (el.textVerticalAlign === TEXT_VERTICAL_ALIGNS.MIDDLE) {
            //         inputRef.current.style.top = state.y + (el.y + (el.height - height / state.zoom) / 2) * state.zoom;
            //     }
            //     else if (el.textVerticalAlign === TEXT_VERTICAL_ALIGNS.BOTTOM) {
            //         inputRef.current.style.top = state.y + (el.y + (el.height - height / state.zoom)) * state.zoom;
            //     }
            //     // Horizontal align
            //     if (el.textAlign === TEXT_ALIGNS.CENTER) {
            //         inputRef.current.style.left = state.x + (el.x - ((width / state.zoom) - el.width) / 2) * state.zoom;
            //     }
            //     else if (el.textAlign === TEXT_ALIGNS.RIGHT) {
            //         inputRef.current.style.left = state.x + (el.x - ((width / state.zoom) - el.width)) * state.zoom;
            //     }
            // }
        };

        // Set input position and initial value
        inputRef.current.style.top = (state.current.translate.y + (element.y  + element.height / 2)* state.current.zoom) + "px";
        inputRef.current.style.left = (state.current.translate.x + (element.x + element.width / 2)* state.current.zoom) + "px";
        inputRef.current.style.color = element.textColor;
        inputRef.current.style.fontSize = (element.textSize * state.current.zoom) + "px";
        inputRef.current.style.fontFamily = element.textFont;
        // inputRef.current.style.textAlign = el.textAlign;
        inputRef.current.value = element.text || ""; // Get text content
        inputRef.current.focus(); // focus in the new input
        updateInput();

        inputRef.current.addEventListener("input", () => updateInput());
        inputRef.current.addEventListener("mousedown", e => e.stopPropagation());
        inputRef.current.addEventListener("mouseup", e => e.stopPropagation());
    }, [state.current.action]);

    const handleZoomChange = delta => {
        submitInput();
        const size = ref.current.getBoundingClientRect();
        const prevZoom = state.current.zoom;
        const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, state.current.zoom + delta));
        const translate = state.current.translate;
        state.current.zoom = nextZoom;
        state.current.translate.x = Math.floor(translate.x + size.width * (prevZoom - nextZoom) / 2);
        state.current.translate.y = Math.floor(translate.y + size.height * (prevZoom - nextZoom) / 2);
        forceUpdate();
    };

    const handleExportClick = () => {
        return null;
    };

    const handleSaveClick = () => {
        return null;
    };

    // Center board in screen
    const centerInScreen = () => {
        const size = ref.current.getBoundingClientRect();
        state.current.translate.x = Math.floor((size.width - props.width) / 2);
        state.current.translate.y = Math.floor((size.height - props.height) / 2);
        forceUpdate();
    };

    // Center the board for the first time
    React.useEffect(() => centerInScreen(), []);

    const {action, tool} = state.current;
    const selectedElements = board.current.getSelectedElements();

    return (
        <div className="position-fixed overflow-hidden top-0 left-0 h-full w-full">
            <Renderer
                ref={ref}
                width={props.width}
                height={props.height}
                tools={props.tools}
                elements={board.current.elements}
                translateX={state.current.translate.x}
                translateY={state.current.translate.y}
                zoom={state.current.zoom}
                brushX={state.current.brush?.x || 0}
                brushY={state.current.brush?.y || 0}
                brushWidth={state.current.brush?.width || 0}
                brushHeight={state.current.brush?.height || 0}
                brushFillColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
                brushStrokeColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
                onPointCanvas={handlePointCanvas}
                onPointElement={handlePointElement}
                onPointHandler={handlePointHandler}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={handleDoubleClick}
                showHandlers={!action && !tool}
                showBrush={action === ACTIONS.SELECTION || action === ACTIONS.SCREENSHOT}
                showSelection={!action && !tool}
                showGrid={true}
            />
            {state.current.action !== ACTIONS.SCREENSHOT && (
                <React.Fragment>
                    <MenuPanel
                        onCameraClick={() => {
                            cancelInput();
                            state.current.tool = null;
                            state.current.action = ACTIONS.SCREENSHOT;
                            board.current.clearSelectedElements();
                            forceUpdate();
                        }}
                        onExportClick={() => handleExportClick()}
                        onSaveClick={() => handleSaveClick()}
                    />
                    <ToolsPanel
                        tools={props.tools}
                        currentAction={state.current.action}
                        currentTool={state.current.tool}
                        onMoveClick={() => {
                            submitInput();
                            state.current.tool = null;
                            state.current.action = ACTIONS.MOVE;
                            board.current.clearSelectedElements();
                            forceUpdate();
                        }}
                        onSelectionClick={() => {
                            submitInput();
                            state.current.tool = null;
                            state.current.action = null;
                            forceUpdate();
                        }}
                        onToolClick={tool => {
                            submitInput();
                            state.current.tool = tool;
                            state.current.action = null;
                            board.current.clearSelectedElements();
                            forceUpdate();
                        }}
                    />
                    <HistoryPanel
                        undoDisabled={board.current.isUndoDisabled()}
                        redoDisabled={board.current.isRedoDisabled()}
                        onUndoClick={() => {
                            cancelInput();
                            board.current.undo();
                            forceUpdate();
                        }}
                        onRedoClick={() => {
                            cancelInput();
                            board.current.redo();
                            forceUpdate();
                        }}
                    />
                    <ZoomPanel
                        zoom={state.current.zoom}
                        onZoomInClick={() => handleZoomChange(ZOOM_STEP)}
                        onZoomOutClick={() => handleZoomChange(-ZOOM_STEP)}
                    />
                    <EditionPanel
                        key={updateKey}
                        selection={selectedElements}
                        styleDialogActive={!!state.current.showStyleDialog && selectedElements.length < 2}
                        onRemoveClick={() => {
                            submitInput();
                            if (selectedElements.length > 0) {
                                board.current.registerSelectionRemove();
                                board.current.removeSelectedElements();
                            }
                            forceUpdate();
                        }}
                        onBringForwardClick={() => {
                            // boardApi.current.bringSelectionForward();
                        }}
                        onSendBackwardClick={() => {
                            // boardApi.current.sendSelectionBackward();
                        }}
                        onGroupSelectionClick={() => {
                            // const group = Folio.generateID();
                            // board.current.registerSelectionUpdate(["group"], [group], false);
                            // board.current.updateSelectedElements("group", group);
                            // forceUpdate();
                        }}
                        onUngroupSelectionClick={() => {
                            // board.current.registerSelectionUpdate(["group"], [null], false);
                            // board.current.updateSelectedElements("group", null);
                            // forceUpdate();
                        }}
                        onStyleDialogToggle={() => {
                            state.current.showStyleDialog = !state.current.showStyleDialog;
                            forceUpdate();
                        }}
                    />
                    {state.current.showStyleDialog && (selectedElements.length < 2) && (
                        <StyleDialog
                            values={selectedElements[0] || state.current.defaults}
                            onChange={(key, value) => {
                                submitInput();
                                if (selectedElements.length > 0) {
                                    board.current.registerSelectionUpdate([key].flat(), [value].flat(), true);
                                    board.current.updateSelectedElements(key, value);
                                }
                                state.current.defaults[key] = value;
                                forceUpdate();
                            }}
                        />
                    )}
                </React.Fragment>
            )}
            {state.current.action === ACTIONS.EDIT_ELEMENT && (
                <TextInput ref={inputRef} />
            )}
        </div>
    );
};

Board.defaultProps = {
    width: 3000,
    height: 1500,
    tools: {},
    grid: true,
    gridSize: 20,
    onScreenshot: null,
};
