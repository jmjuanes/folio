import React from "react";
import {
    ELEMENTS,
    ACTIONS,
    DIALOGS,
    SCREENSHOT_FILL_COLOR,
    SCREENSHOT_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
} from "./constants.js";
import {useApp} from "./hooks/useApp.js";
import {
    EditionPanel,
    HistoryPanel,
    ToolsPanel,
    ZoomPanel,
    MenuPanel,
} from "./components/Panels/index.jsx";
import {
    FillDialog,
    StrokeDialog,
    TextDialog,
    ShapeDialog,
    ArrowheadDialog,
} from "./components/Dialogs/index.jsx";
import {Canvas} from "./components/Canvas/index.jsx";
import {DefaultButton, SimpleButton} from "./components/Buttons/index.jsx";
import {DownloadIcon, CameraIcon, ToolIcon} from "./components/icons/index.jsx";
import {blobToDataUrl} from "./utils/index.js";
import {
    exportToBlob,
    exportToClipboard,
    exportToFile,
} from "./export.js";

const Board = React.forwardRef((props, ref) => {
    const imageInputRef = React.useRef();
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const activeDialog = React.useRef(null);
    const app = useApp({
        onUpdate: forceUpdate,
        onScreenshot: props.onScreenshot,
    });

    // Register element change
    const handleElementChange = (key, value) => {
        app.updateElements(selectedElements, [key], [value], true);
        return app.update();
    };

    // After mounting board component
    const handleBoardMount = () => {
        // Check for loading initial data from props
        if (props?.initialData) {
            app.setElements(props.initialData?.elements || []);
            app.setAssets(props.initialData?.assets || {});
            app.setHistory(props.initialData?.history || []);
            app.setState(props.initialData?.state || {});
            app.update();
        }
        props?.onMount?.();
    };

    // Image input change listener
    const handleImageInputChange = event => {
        const file = event.target.files?.[0];
        if (file) {
            return blobToDataUrl(file).then(data => {
                return app.addImage(data);
            })
            .then(() => {
                event.target.value = "";
                app.update();
            });
        }
    };

    // Handle screenshot button click
    const handleScreenshotClick = () => {
        // app.cancelAction();
        app.setAction(ACTIONS.SCREENSHOT);
    };

    // Handle settings click
    const handleSettingsClick = () => {
        app.cancelAction();
    };

    // Register effects
    React.useEffect(() => handleBoardMount(), []);

    // const {action, tool} = app.state;
    const action = app.state.activeAction;
    const selectedElements = app.getSelectedElements();

    // Force to reset the active dialog if there is an action or a tool active
    if (app.state.activeAction || app.state.activeTool) {
        activeDialog.current = null;
    }

    // Compute common values for selected elements to be used in dialogs
    let selectionValues = app.state.style || {};
    if (activeDialog.current && selectedElements.length > 0) {
        // TODO: we need to compute common values if length > 1
        if (selectedElements.length === 1) {
            selectionValues = selectedElements[0];
        }
    }

    // Display actions buttons
    const showActions = props.showExportButton || props.showScreenshotButton || props.showSettingsButton;
    const showMenu = (props.showLogo && !!props.logo) || (props.showTitle && !!props.title);
    const isScreenshot = action === ACTIONS.SCREENSHOT;

    return (
        <div className="d:flex flex:row w:full h:full">
            <div className="position:relative overflow:hidden h:full w:full">
                <Canvas
                    id={app.id}
                    elements={app.elements}
                    assets={app.assets}
                    translateX={app.state.translateX}
                    translateY={app.state.translateY}
                    zoom={app.state.zoom}
                    brush={app.state.selection}
                    brushFillColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
                    brushStrokeColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
                    showHandlers={!app.state.activeAction && !app.state.activeTool}
                    showBrush={action === ACTIONS.SELECT || action === ACTIONS.SCREENSHOT}
                    showBounds={!app.state.activeAction && !app.state.activeTool}
                    showGrid={true}
                    {...app.events}
                />
                {!isScreenshot && props.showTools && (
                    <ToolsPanel
                        className={showMenu ? "pt:20" : ""}
                        action={app.state.activeAction}
                        tool={app.state.activeTool}
                        onMoveClick={() => {
                            app.state.activeTool = null;
                            app.setAction(ACTIONS.MOVE);
                        }}
                        onSelectionClick={() => app.setTool(null)}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return imageInputRef.current.click();
                            }
                            app.setTool(tool);
                        }}
                    />
                )}
                {!isScreenshot && props.showHistory && (
                    <HistoryPanel
                        undoDisabled={app.isUndoDisabled()}
                        redoDisabled={app.isRedoDisabled()}
                        onUndoClick={() => app.undo()}
                        onRedoClick={() => app.redo()}
                    />
                )}
                {!isScreenshot && props.showZoom && (
                    <ZoomPanel
                        zoom={app.state.zoom}
                        onZoomInClick={() => app.zoomIn()}
                        onZoomOutClick={() => app.zoomOut()}
                    />
                )}
                {!isScreenshot && props.showEdition && (
                    <EditionPanel
                        key={updateKey}
                        className={showActions ? "pt:20" : ""}
                        elements={selectedElements}
                        dialog={activeDialog.current}
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
                        onDialogClick={id => {
                            activeDialog.current = id;
                            forceUpdate();
                        }}
                    />
                )}
                {!action && !!activeDialog.current && selectedElements.length < 2 && (
                    <React.Fragment>
                        {activeDialog.current === DIALOGS.FILL && (
                            <FillDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {activeDialog.current === DIALOGS.STROKE && (
                            <StrokeDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {activeDialog.current === DIALOGS.TEXT && (
                            <TextDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {activeDialog.current === DIALOGS.SHAPE && (
                            <ShapeDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {activeDialog.current === DIALOGS.ARROWHEAD && (
                            <ArrowheadDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                    </React.Fragment>
                )}
                {!isScreenshot && showMenu && (
                    <MenuPanel
                        title={props.title}
                        logo={props.logo}
                        onLogoClick={props.onLogoClick}
                    />
                )}
                {!isScreenshot && showActions && (
                    <div className="position:absolute top:0 right:0 pt:4 pr:4 z:10">
                        <div className="d:flex gap:3 pt:1 pb:1">
                            {props.showScreenshotButton && (
                                <SimpleButton onClick={handleScreenshotClick}>
                                    <CameraIcon />
                                </SimpleButton>
                            )}
                            {props.showSettingsButton && (
                                <SimpleButton onClick={handleSettingsClick}>
                                    <ToolIcon />
                                </SimpleButton>
                            )}
                            {props.showExportButton && (
                                <DefaultButton text="Export" onClick={props.onExport}>
                                    <DownloadIcon />
                                </DefaultButton>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Image input reference */}
            <input
                ref={imageInputRef}    
                type="file"
                accept="image/*"
                onChange={handleImageInputChange}
                style={{
                    display: "none",
                    visibility: "hidden",
                }}
            />
        </div>
    );
});

Board.defaultProps = {
    initialData: null,
    logo: "",
    title: "Untitled",
    width: 0,
    height: 0,
    showZoom: true,
    showHistory: true,
    showTools: true,
    showEdition: true,
    showMenuButton: true,
    showExportButton: true,
    showScreenshotButton: true,
    showSettingsButton: true,
    showTitle: true,
    showLogo: true,
    onChange: null,
    onScreenshot: null,
    onExport: null,
    onSave: null,
    onMount: null,
    onLogoClick: null,
};

// Folio export
export default {
    Board,
    Canvas,
    exportToBlob,
    exportToClipboard,
    exportToFile,
};
