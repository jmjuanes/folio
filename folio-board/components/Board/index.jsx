import React from "react";
import {
    IS_DARWIN,
    ACTIONS,
    EVENTS,
    KEYS,
    HANDLERS,
    ELEMENT_CHANGES,
    ZOOM_STEP,
    ZOOM_MIN,
    ZOOM_MAX,
    SCREENSHOT_FILL_COLOR,
    SCREENSHOT_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
} from "../../constants.js";
import {useApp} from "../../hooks/useApp.js";
// import {useBoundaryPoints} from "../../hooks/useBoundaryPoints.js";
import {
    EditionPanel,
    HistoryPanel,
    MenuPanel,
    ToolsPanel,
    ZoomPanel,
} from "../Panels/index.jsx";
import {
    StyleDialog,
} from "../Dialogs/index.jsx";
import {Canvas} from "../Canvas/index.jsx";
import {TextInput} from "./TextInput.jsx";
import {
    isArrowKey,
    isInputTarget,
    normalizeRectangle,
    pointInRectangle,
    measureText,
} from "../../utils/index.js";
import {getElementConfig } from "../../elements/index.jsx";


export const Board = props => {
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const svgRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const app = useApp();
    const state = React.useRef({
        tool: null,
        action: null,
        activeElement: null,
        // activeGroup: null,
        activeHandler: null,
        zoom: 1,
        translateX: 0,
        translateY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0,
        snapshot: null,
        brush: null,
    });
    const [styleDialogVisible, setStyleDialogVisible] = React.useState(false);

    // Calculate the position using the grid size
    const getPosition = v => {
        return props.grid ? Math.round(v / props.gridSize) * props.gridSize : v;
    };

    const submitInput = () => {
        if (state.current.action === ACTIONS.EDIT_ELEMENT && state.current.activeElement) {
            const value = inputRef.current.value || "";
            const element = app.current.activeElement;
            element.selected = true;
            element.editing = false;
            if (element.text !== value) {
                app.current.registerSelectionUpdate(["text"], [value], false);
                element.text = value;
            }
            app.current.activeElement = null;
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
            app.current.clearSelectedElements();
            forceUpdate();
        }
    };

    // Handle point element
    const handlePointElement = event => {
        if (!state.current.tool && !state.current.action) {
            const element = app.current.getElement(event.element);
            if (!event.shiftKey) {
                app.current.clearSelectedElements();
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
    const handlePointResizeHandler = event => {
        state.current.action = ACTIONS.RESIZE_ELEMENT,
        state.current.activeHandler = event.handler;
    };

    const handlePointerDown = event => {
        if (state.current.action === ACTIONS.EDIT_ELEMENT) {
            submitInput();
        }
        if (state.current.tool) {
            state.current.action = ACTIONS.CREATE_ELEMENT;
            const element = app.current.createElement(state.current.tool);
            const elementConfig = getElementConfig(element);
            // Override element attributes
            Object.assign(
                element,
                elementConfig.initialize(),
                elementConfig.onCreateStart?.(element, event, getPosition),
            );
            state.current.activeElement = element; // Save element reference
            // app.current.activeGroup = null; // Reset current group
            app.current.clearSelectedElements();
        }
        else if (app.current.getSelectedElements().length > 0) {
            if (!state.current.action) {
                state.current.action = ACTIONS.DRAG_ELEMENT;
            }
            state.current.snapshot = app.current.snapshotSelectedElements();
            state.current.isResized = false;
            state.current.isDragged = false;
        }
        else if (state.current.action === ACTIONS.MOVE) {
            // We need to update the last translated point before start moving the board
            state.current.lastTranslateX = state.current.translateX;
            state.current.lastTranslateY = state.current.translateY;
        }
        else if (!state.current.action || state.current.action === ACTIONS.SCREENSHOT) {
            state.current.action = state.current.action || ACTIONS.SELECTION;
            state.current.brush.x1 = event.originalX;
            state.current.brush.y1 = event.originalY;
            state.current.brush.x2 = event.originalX;
            state.current.brush.y2 = event.originalY;
        }
        forceUpdate();
    };

    const handlePointerMove = event => {
        if (state.current.action === ACTIONS.MOVE) {
            state.current.translateX = Math.floor(state.current.lastTranslateX + event.dx * state.current.zoom);
            state.current.translateY = Math.floor(state.current.lastTranslateY + event.dy * state.current.zoom);
        }
        else if (state.current.action === ACTIONS.CREATE_ELEMENT) {
            Object.assign(
                state.current.activeElement,
                getElementConfig(state.current.activeElement)?.onCreateMove?.(state.current.activeElement, event, getPosition),
                // props.tools[state.current.tool]?.onCreateMove?.(state.current.activeElement, event, getPosition),
            );
        }
        else if (state.current.action === ACTIONS.DRAG_ELEMENT) {
            const snapshot = state.current.snapshot;
            state.current.isDragged = true;
            app.current.getSelectedElements().forEach((element, index) => {
                Object.assign(element, getElementConfig(element)?.onDrag?.(snapshot[index], event, getPosition) || {});
            });
        }
        else if (state.current.action === ACTIONS.RESIZE_ELEMENT) {
            // const snapshot = state.current.snapshot[0];
            // const element = app.current.getElementById(snapshot.id);
            // state.current.isResized = true;
            // if (state.current.activeHandler === HANDLERS.CORNER_TOP_LEFT) {
            //     element.x = Math.min(getPosition(snapshot.x + event.dx), snapshot.x + snapshot.width - 1);
            //     element.width = snapshot.width + (snapshot.x - element.x);
            //     element.y = Math.min(getPosition(snapshot.y + event.dy), snapshot.y + snapshot.height - 1);
            //     element.height = snapshot.height + (snapshot.y - element.y);
            // }
            // else if (state.current.activeHandler === HANDLERS.CORNER_TOP_RIGHT) {
            //     element.width = Math.max(getPosition(snapshot.x + snapshot.width + event.dx) - snapshot.x, 1);
            //     element.y = Math.min(getPosition(snapshot.y + event.dy), snapshot.y + snapshot.height - 1);
            //     element.height = snapshot.height + (snapshot.y - element.y);
            // }
            // else if (state.current.activeHandler === HANDLERS.CORNER_BOTTOM_LEFT) {
            //     element.x = Math.min(getPosition(snapshot.x + event.dx), snapshot.x + snapshot.width - 1);
            //     element.width = snapshot.width + (snapshot.x - element.x);
            //     element.height = Math.max(getPosition(snapshot.y + snapshot.height + event.dy) - snapshot.y, 1);
            // }
            // else if (state.current.activeHandler === HANDLERS.CORNER_BOTTOM_RIGHT) {
            //     element.width = Math.max(getPosition(snapshot.x + snapshot.width + event.dx) - snapshot.x, 1);
            //     element.height = Math.max(getPosition(snapshot.y + snapshot.height + event.dy) - snapshot.y, 1);
            // }
            // else if (state.current.activeHandler === HANDLERS.EDGE_TOP) {
            //     element.y = Math.min(getPosition(snapshot.y + event.dy), snapshot.y + snapshot.height - 1);
            //     element.height = snapshot.height + (snapshot.y - element.y);
            // }
            // else if (state.current.activeHandler === HANDLERS.EDGE_BOTTOM) {
            //     element.height = Math.max(getPosition(snapshot.y + snapshot.height + event.dy) - snapshot.y, 1);
            // }
            // else if (state.current.activeHandler === HANDLERS.EDGE_LEFT) {
            //     element.x = Math.min(getPosition(snapshot.x + event.dx), snapshot.x + snapshot.width - 1);
            //     element.width = snapshot.width + (snapshot.x - element.x);
            // }
            // else if (state.current.activeHandler === HANDLERS.EDGE_RIGHT) {
            //     element.width = Math.max(getPosition(snapshot.x + snapshot.width + event.dx) - snapshot.x, 1);
            // }
            // else if (state.current.activeHandler === HANDLERS.POINT_START) {
            //     element.x = getPosition(snapshot.x + event.dx);
            //     element.y = getPosition(snapshot.y + event.dy);
            // }
            // else if (state.current.activeHandler === HANDLERS.POINT_END) {
            //     element.x2 = getPosition(snapshot.x2 + event.dx);
            //     element.y2 = getPosition(snapshot.y2 + event.dy);
            // }
        }
        else if (state.current.action === ACTIONS.SELECTION || state.current.action === ACTIONS.SCREENSHOT) {
            state.current.brush.x2 = event.currentX;
            state.current.brush.y2 = event.currentY;
        }
        forceUpdate();
    };

    const handlePointerUp = event => {
        if (state.current.action === ACTIONS.MOVE) {
            state.current.lastTranslateX = state.current.translateX;
            state.current.lastTranslateY = state.current.translateY;
        }
        else if (state.current.action === ACTIONS.CREATE_ELEMENT) {
            // state.current.activeElement.selected = true;
            Object.assign(state.current.activeElement, {
                ...(getElementConfig(state.current.activeElement)?.onCreateEnd?.(state.current.activeElement, event, getPosition) || {}),
                selected: true,
            });
            app.current.registerElementCreate(state.current.activeElement);
            state.current.activeElement = null;
            state.current.tool = null; // reset active tool
            state.current.action = null;
        }
        else if (state.current.action === ACTIONS.DRAG_ELEMENT || state.current.action === ACTIONS.RESIZE_ELEMENT) {
            if (state.current.isDragged || state.current.isResized) {
                // const snapshot = state.current.snapshot;
                // const keys = state.current.isDragged ? ["x", "y"] : ["x", "y", "width", "height"];
                // app.current.addHistoryEntry({
                //     type: ELEMENT_CHANGE_TYPES.UPDATE,
                //     elements: app.current.getSelectedElements().map((el, index) => ({
                //         id: el.id,
                //         prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                //         newValues: Object.fromEntries(keys.map(key => [key, el[key]])),
                //     })),
                // });
            }
            state.current.isDragged = false;
            state.current.isResized = false;
            state.current.action = null;
        }
        else if (state.current.action === ACTIONS.SELECTION) {
            // const rectangle = normalizeRectangle(state.current.brush);
            // // Select all elements that are in the selected rectangle
            // app.current.getElements().forEach(element => {
            //     const points = useBoundaryPoints(element);
            //     element.selected = points.some(point => {
            //         return pointInRectangle(point, rectangle);
            //     });
            // });
            state.current.action = null;
        }
        else if (state.current.action === ACTIONS.SCREENSHOT) {
            // const screenshotOptions = {
            //     includeBackground: false,
            //     region: state.current.brush,
            // };
            // toImagePNG(ref.current, props.width, props.height, screenshotOptions).then(image => {
            //     props.onScreenshot?.(image);
            //     // navigator.clipboard.write([
            //     //     new ClipboardItem({
            //     //         [image.type]: image,
            //     //     }),
            //     // ]);
            // });
            state.current.action = null;
        }
        // Reset current state
        // state.current.action = null;
        forceUpdate();
    };

    // Handle double click
    const handleDoubleClick = () => {
        if (!state.current.action && !state.current.tool) {
            const selection = app.current.getSelectedElements();
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
                    app.current.copy();
                }
                // Check for backspace key or cut --> remove elements
                if (event.key === KEYS.BACKSPACE || event.key === KEYS.X) {
                    app.current.registerSelectionRemove();
                    app.current.removeSelectedElements();
                    // Reset active group if all elements of this group have been removed
                    // if (app.current.getElementsInActiveGroup().length < 1) {
                    //     app.current.activeGroup = null;
                    // }
                }
                forceUpdate();
            }
            // Undo or redo key
            else if (isCtrlKey && (event.key === KEYS.Z || event.key === KEYS.Y)) {
                event.key === KEYS.Z ? app.current.undo() : app.current.redo();
                forceUpdate();
            }
            // Check ESCAPE key
            else if (event.key === KEYS.ESCAPE) {
                event.preventDefault();
                app.current.clearSelectedElements();
                if (state.current.action === ACTIONS.SCREENSHOT) {
                    state.current.action = null;
                }
                // app.current.activeGroup = null;
                forceUpdate();
            }
            // Check for arrow keys --> move elements
            else if (isArrowKey(event.key)) {
                event.preventDefault();
                // const step = event.shiftKey ? (props.gridSize || 10) : 1;
                const direction = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
                const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
                const selectedElements = app.current.getSelectedElements();
                app.current.addHistoryEntry({
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

    React.useEffect(() => {
        const handlePaste = event => {
            // if (!isInputTarget(event)) {
            //     event.preventDefault();
            //     app.current.paste(event);
            // }
        };
        document.addEventListener(EVENTS.PASTE, handlePaste, false);
        return () => {
            document.removeEventListener(EVENTS.PASTE, handlePaste, false);
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
        inputRef.current.style.top = (state.current.translateY + (element.y  + element.height / 2)* state.current.zoom) + "px";
        inputRef.current.style.left = (state.current.translateX + (element.x + element.width / 2)* state.current.zoom) + "px";
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
        const size = svgRef.current.getBoundingClientRect();
        const prevZoom = state.current.zoom;
        const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, state.current.zoom + delta));
        state.current.zoom = nextZoom;
        state.current.translateX = Math.floor(state.current.translateX + size.width * (prevZoom - nextZoom) / 2);
        state.current.translateY = Math.floor(state.current.translateY + size.height * (prevZoom - nextZoom) / 2);
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
        const size = svgRef.current.getBoundingClientRect();
        state.current.translateX = Math.floor((size.width - props.width) / 2);
        state.current.translateY = Math.floor((size.height - props.height) / 2);
        forceUpdate();
    };

    // Center the board for the first time
    React.useEffect(() => centerInScreen(), []);

    const {action, tool} = state.current;
    const selectedElements = app.current.getSelectedElements();

    return (
        <div className="position-fixed overflow-hidden top-0 left-0 h-full w-full">
            <Canvas
                ref={svgRef}
                width={props.width}
                height={props.height}
                elements={app.current.elements}
                translateX={state.current.translateX}
                translateY={state.current.translateY}
                zoom={state.current.zoom}
                brush={state.current.brush}
                brushFillColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
                brushStrokeColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
                onPointCanvas={handlePointCanvas}
                onPointElement={handlePointElement}
                onPointResizeHandler={handlePointResizeHandler}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={handleDoubleClick}
                showResizeHandlers={!action && !tool}
                showNodeHandlers={!action && !tool}
                showBrush={action === ACTIONS.SELECTION || action === ACTIONS.SCREENSHOT}
                showBounds={!action && !tool}
                showGrid={true}
            />
            {state.current.action !== ACTIONS.SCREENSHOT && (
                <React.Fragment>
                    <MenuPanel
                        onCameraClick={() => {
                            cancelInput();
                            state.current.tool = null;
                            state.current.action = ACTIONS.SCREENSHOT;
                            app.current.clearSelectedElements();
                            forceUpdate();
                        }}
                        onExportClick={() => handleExportClick()}
                        onSaveClick={() => handleSaveClick()}
                    />
                    <ToolsPanel
                        currentAction={state.current.action}
                        currentTool={state.current.tool}
                        onMoveClick={() => {
                            submitInput();
                            state.current.tool = null;
                            state.current.action = ACTIONS.MOVE;
                            app.current.clearSelectedElements();
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
                            app.current.clearSelectedElements();
                            forceUpdate();
                        }}
                    />
                    <HistoryPanel
                        undoDisabled={app.current.isUndoDisabled()}
                        redoDisabled={app.current.isRedoDisabled()}
                        onUndoClick={() => {
                            cancelInput();
                            app.current.undo();
                            forceUpdate();
                        }}
                        onRedoClick={() => {
                            cancelInput();
                            app.current.redo();
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
                                app.current.registerSelectionRemove();
                                app.current.removeSelectedElements();
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
                            // app.current.registerSelectionUpdate(["group"], [group], false);
                            // app.current.updateSelectedElements("group", group);
                            // forceUpdate();
                        }}
                        onUngroupSelectionClick={() => {
                            // app.current.registerSelectionUpdate(["group"], [null], false);
                            // app.current.updateSelectedElements("group", null);
                            // forceUpdate();
                        }}
                        onStyleDialogToggle={() => {
                            return setStyleDialogVisible(!styleDialogVisible);
                        }}
                    />
                    {/*
                    {state.current.showStyleDialog && (selectedElements.length < 2) && (
                        <StyleDialog
                            values={selectedElements[0] || state.current.defaults}
                            onChange={(key, value) => {
                                submitInput();
                                if (selectedElements.length > 0) {
                                    app.current.registerSelectionUpdate([key].flat(), [value].flat(), true);
                                    app.current.updateSelectedElements(key, value);
                                }
                                state.current.defaults[key] = value;
                                forceUpdate();
                            }}
                        />
                    )}
                    */}
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
    grid: true,
    gridSize: 20,
    onScreenshot: null,
    onExport: null,
    onMount: null
};
