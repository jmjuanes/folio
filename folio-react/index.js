import React from "react";

import {
    DEFAULT_GRID_COLOR,
    DEFAULT_GRID_OPACITY,
    DEFAULT_GRID_SIZE,
    DEFAULT_GRID_STYLE,
    ELEMENT_TYPES,
} from "./constants.js";

import {Board} from "./components/Board.js";
import {Grid} from "./components/Grid.js";
import {Menubar} from "./components/Menubar.js";
import {Stylebar} from "./components/Stylebar.js";
import {Toolbar} from "./components/Toolbar.js";
import {Historybar} from "./components/Historybar.js";
import {When} from "./commons/When.js";

export const Folio = props => {
    const parentRef = React.useRef(null);
    const boardApi = React.useRef(null);

    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [state, setState] = React.useState({
        ready: false,
        width: 0,
        height: 0,
        selectedTool: ELEMENT_TYPES.SELECTION,
        gridEnabled: !!props.gridEnabled,
        gridColor: props.gridColor,
        gridSize: props.gridSize,
        gridStyle: props.gridStyle,
        gridOpacity: props.gridOpacity,
    });

    React.useEffect(() => {
        const handleResize = () => {
            setState(prevState => ({
                ...prevState,
                width: parentRef.current.offsetWidth,
                height: parentRef.current.offsetHeight,
            }));
        };
        window.addEventListener("resize", handleResize, false);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize, false);
        };
    }, []);

    return (
        <div className="is-relative has-w-full has-h-full" ref={parentRef}>
            {state.gridEnabled && (
                <Grid
                    width={state.width}
                    height={state.height}
                    color={state.gridColor}
                    size={state.gridSize}
                    opacity={state.gridOpacity}
                />
            )}
            <Board
                ref={boardApi}
                width={state.width}
                height={state.height}
                selectedTool={state.selectedTool}
                gridEnabled={state.gridEnabled}
                gridSize={state.gridSize}
                onScreenshot={blob => {
                    setState(prevState => ({
                        ...prevState,
                        selectedTool: ELEMENT_TYPES.SELECTION,
                    }));
                    typeof props.onScreenshot === "function" && props.onScreenshot(blob);
                }}
                onUpdate={() => forceUpdate()}
            />
            <Menubar
                options={state}
                gridEnabled={state.gridEnabled}
                cameraEnabled={state.selectedTool === ELEMENT_TYPES.SCREENSHOT}
                onGridClick={() => {
                    setState(prevState => ({
                        ...prevState,
                        gridEnabled: !state.gridEnabled,
                    }));
                }}
                onCameraClick={() => {
                    const current = state.selectedTool;
                    setState(prevState => ({
                        ...prevState,
                        selectedTool: current === ELEMENT_TYPES.SCREENSHOT ? ELEMENT_TYPES.SELECTION : ELEMENT_TYPES.SCREENSHOT,
                    }));
                }}
                onOptionsChange={(name, value) => {
                    setState(prevState => ({...prevState, [name]: value}));
                }}
            />
            <When
                condition={boardApi.current && state.selectedTool !== ELEMENT_TYPES.SCREENSHOT}
                render={() => (
                    <React.Fragment>
                        <Toolbar
                            currentType={state.selectedTool}
                            onTypeChange={type => {
                                setState(prevState => ({...prevState, selectedTool: type}));
                            }}
                        />
                        <Stylebar
                            key={state.selectedTool + updateKey}
                            selection={boardApi.current.getSelection()}
                            selectionLocked={boardApi.current.isSelectionLocked()}
                            activeGroup={boardApi.current.getActiveGroup()}
                            onChange={(n, v) => {
                                boardApi.current.updateSelection(n, v);
                            }}
                            onRemoveClick={() => {
                                boardApi.current.removeSelection();
                                forceUpdate();
                            }}
                            onBringForwardClick={() => {
                                boardApi.current.bringSelectionForward();
                            }}
                            onSendBackwardClick={() => {
                                boardApi.current.sendSelectionBackward();
                            }}
                            onGroupSelectionClick={() => {
                                boardApi.current.groupSelection();
                                forceUpdate();
                            }}
                            onUngroupSelectionClick={() => {
                                boardApi.current.ungroupSelection();
                                forceUpdate();
                            }}
                        />
                        <Historybar
                            undoDisabled={boardApi.current.isUndoDisabled()}
                            redoDisabled={boardApi.current.isRedoDisabled()}
                            onUndoClick={() => {
                                boardApi.current.undo();
                                forceUpdate();
                            }}
                            onRedoClick={() => {
                                boardApi.current.redo();
                                forceUpdate();
                            }}
                        />
                    </React.Fragment>
                )}
            />
        </div>
    );
};

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
