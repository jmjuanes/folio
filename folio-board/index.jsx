import React from "react";
import {
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
} from "./constants.js";
import {useApp} from "./hooks/useApp.js";
import {
    EditionPanel,
    HistoryPanel,
    MenuPanel,
    ToolsPanel,
    ZoomPanel,
} from "./components/Panels/index.jsx";
import {StyleDialog} from "./components/Dialogs/index.jsx";
import {Canvas} from "./components/Canvas/index.jsx";

export const FolioBoard = props => {
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [styleDialogVisible, setStyleDialogVisible] = React.useState(false);
    // const ref = React.useRef(null);
    const app = useApp({
        onUpdate: forceUpdate,
        onScreenshot: props.onScreenshot,
    });

    // Center board in screen
    // const centerInScreen = () => {
    //     const size = svgRef.current.getBoundingClientRect();
    //     state.current.translateX = Math.floor((size.width - props.width) / 2);
    //     state.current.translateY = Math.floor((size.height - props.height) / 2);
    //     forceUpdate();
    // };

    // After mounting board component
    const handleBoardMount = () => {
        props?.onMount?.(app);
    };

    // Register effects
    React.useEffect(() => handleBoardMount(), []);

    // const {action, tool} = app.state;
    const action = app.state.activeAction;
    const selectedElements = app.getSelectedElements();

    return (
        <div className="position-fixed overflow-hidden top-0 left-0 h-full w-full">
            <Canvas
                id={app.id}
                width={app.state.width || props.width}
                height={app.state.height || props.height}
                elements={app.state.elements}
                translateX={app.state.translateX}
                translateY={app.state.translateY}
                zoom={app.state.zoom}
                brush={app.state.selection}
                brushFillColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
                brushStrokeColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
                showHandlers={!app.state.activeAction && !app.state.activeTool}
                showBrush={action === ACTIONS.SELECTION || action === ACTIONS.SCREENSHOT}
                showBounds={!app.state.activeAction && !app.state.activeTool}
                showGrid={true}
                {...app.events}
            />
            {props.showMenu && (
                <MenuPanel
                    onCameraClick={() => {
                        app.state.activeTool = null;
                        app.setAction(ACTIONS.SCREENSHOT);
                    }}
                    onExportClick={() => handleExportClick()}
                    onSaveClick={() => handleSaveClick()}
                />
            )}
            {props.showTools && (
                <ToolsPanel
                    action={app.state.activeAction}
                    tool={app.state.activeTool}
                    onMoveClick={() => {
                        app.state.activeTool = null;
                        app.setAction(ACTIONS.MOVE);
                    }}
                    onSelectionClick={() => app.setTool(null)}
                    onToolClick={tool => app.setTool(tool)}
                />
            )}
            {props.showHistory && (
                <HistoryPanel
                    undoDisabled={app.isUndoDisabled()}
                    redoDisabled={app.isRedoDisabled()}
                    onUndoClick={() => app.undo()}
                    onRedoClick={() => app.redo()}
                />
            )}
            {props.showZoom && (
                <ZoomPanel
                    zoom={state.current.zoom}
                    onZoomInClick={() => app.zoomIn()}
                    onZoomOutClick={() => app.zoomOut()}
                />
            )}
            {props.showEdition && (
                <EditionPanel
                    key={updateKey}
                    elements={selectedElements}
                    styleDialogActive={!!state.current.showStyleDialog}
                    onRemoveClick={() => {
                        app.cancelAction();
                        app.removeElements(selectedElements);
                        app.update();
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
            )}
            {!action && styleDialogVisible && selectedElements.length < 2 && (
                <StyleDialog
                    elements={selectedElements}
                    values={app.state.style}
                    onChange={(key, value) => {
                        app.updateElements(selectedElements, [key], [value], true);
                        app.update();
                    }}
                />
            )}
        </div>
    );
};

FolioBoard.defaultProps = {
    width: 0,
    height: 0,
    showMenu: true,
    showZoom: true,
    showHistory: true,
    showTools: true,
    showEdition: true,
    onChange: null,
    onScreenshot: null,
    onExport: null,
    onSave: null,
    onMount: null
};
