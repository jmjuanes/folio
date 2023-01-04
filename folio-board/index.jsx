import React from "react";
import {
    ELEMENTS,
    SCREENSHOT_FILL_COLOR,
    SCREENSHOT_STROKE_COLOR,
    SELECTION_FILL_COLOR,
    SELECTION_STROKE_COLOR,
    EXPORT_FORMATS,
    Canvas,
    exportToBlob,
    exportToClipboard,
    exportToFile,
} from "folio-core";
import {
    ACTIONS,
    DIALOGS,
    FILE_EXTENSIONS,
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
import {DefaultButton, SimpleButton} from "./components/Buttons/index.jsx";
import {ExportPanel, SettingsPanel} from "./components/SidePanels/index.jsx";
import {
    DownloadIcon,
    CameraIcon,
    ToolIcon,
    TrashIcon,
} from "./components/icons/index.jsx";
import {blobToDataUrl} from "./utils/blob.js";
import {formatDate} from "./utils/date.js";
import {boardStyles} from "./styles.js";

const FolioBoard = props => {
    const imageInputRef = React.useRef();
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [exportValues, setExportValues] = React.useState({});
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
            app.load(props.initialData)
            app.update();
        }
        // Call the onmount listener
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

    // Handle export button click
    const handleExportClick = () => {
        if (typeof props.onExportClick === "function") {
            return props.onExportClick();
        }
        app.cancelAction();
        app.state.showExport = !app.state.showExport;
        app.state.showSettings = false;
        // app.update();
        setExportValues({
            filename: `untitled-${formatDate()}`,
            background: false,
            format: EXPORT_FORMATS.PNG,
            scale: 1,
        });
    };

    // Handle screenshot button click
    const handleScreenshotClick = () => {
        app.state.showSettings = false;
        app.state.showExport = false;
        app.setAction(ACTIONS.SCREENSHOT);
    };

    // Handle settings click
    const handleSettingsClick = () => {
        if (typeof props.onSettingsClick === "function") {
            return props.onSettingsClick();
        }
        app.cancelAction();
        app.state.showSettings = !app.state.showSettings;
        app.state.showExport = false;
        app.update();
    };

    const handleClearClick = () => {
        if (typeof props.onClearClick === "function") {
            return props.onClearClick();
        }
        // TODO: we need to display a confirmation message
        app.reset();
        app.update();
    };

    // Register effects
    React.useEffect(() => handleBoardMount(), []);

    // const {action, tool} = app.state;
    const action = app.state.activeAction;
    const selectedElements = app.getSelectedElements();

    // Force to reset the active dialog if there is an action or a tool active
    if (app.state.activeAction || app.state.activeTool) {
        app.state.activeDialog = null;
    }

    // Compute common values for selected elements to be used in dialogs
    let selectionValues = app.state.style || {};
    if (app.state.activeDialog && selectedElements.length > 0) {
        // TODO: we need to compute common values if length > 1
        if (selectedElements.length === 1) {
            selectionValues = selectedElements[0];
        }
    }

    // Display actions buttons
    const showActions = (
        props.showExportButton || 
        props.showScreenshotButton || 
        props.showSettingsButton ||
        props.showClearButton
    );
    const showMenu = (props.showLogo && !!props.logo) || (props.showTitle && !!props.title);
    const isScreenshot = action === ACTIONS.SCREENSHOT;

    return (
        <div className="d:flex flex:row w:full h:full">
            <div className="position:relative overflow:hidden h:full w:full">
                <Canvas
                    key={app.state.showExport || app.state.showSettings}
                    id={app.id}
                    elements={app.elements}
                    assets={app.assets}
                    styles={boardStyles}
                    backgroundColor={app.state.background}
                    translateX={app.state.translateX}
                    translateY={app.state.translateY}
                    zoom={app.state.zoom}
                    brush={app.state.selection}
                    brushFillColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_FILL_COLOR : SELECTION_FILL_COLOR}
                    brushStrokeColor={action === ACTIONS.SCREENSHOT ? SCREENSHOT_STROKE_COLOR : SELECTION_STROKE_COLOR}
                    showHandlers={!app.state.activeAction && !app.state.activeTool}
                    showBrush={action === ACTIONS.SELECT || action === ACTIONS.SCREENSHOT}
                    showBounds={!app.state.activeAction && !app.state.activeTool}
                    showGrid={!!app.state.grid}
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
                        dialog={app.state.activeDialog}
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
                            // const group = Folio.generateRandomId();
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
                            app.state.activeDialog = id;
                            forceUpdate();
                        }}
                    />
                )}
                {!action && !!app.state.activeDialog && selectedElements.length < 2 && (
                    <React.Fragment>
                        {app.state.activeDialog === DIALOGS.FILL && (
                            <FillDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {app.state.activeDialog === DIALOGS.STROKE && (
                            <StrokeDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {app.state.activeDialog === DIALOGS.TEXT && (
                            <TextDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {app.state.activeDialog === DIALOGS.SHAPE && (
                            <ShapeDialog
                                className={showActions ? "pt:20" : ""}
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {app.state.activeDialog === DIALOGS.ARROWHEAD && (
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
                            {props.showClearButton && (
                                <SimpleButton onClick={handleClearClick}>
                                    <TrashIcon />
                                </SimpleButton>
                            )}
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
                                <DefaultButton text="Export" onClick={handleExportClick}>
                                    <DownloadIcon />
                                </DefaultButton>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {app.state.showSettings && (
                <SettingsPanel
                    values={app.getState()}
                    onClose={() => {
                        app.state.showSettings = false;
                        app.update();
                    }}
                    onChange={(key, value) => {
                        app.updateState(key, value);
                        app.update();
                    }}
                />
            )}
            {app.state.showExport && (
                <ExportPanel
                    values={exportValues}
                    onClose={() => {
                        app.state.showExport = false;
                        app.update();
                    }}
                    onChange={(key, value) => {
                        setExportValues(prevExportValues => ({
                            ...prevExportValues,
                            [key]: value,
                        }))
                    }}
                    onSubmit={() => {
                        if (typeof props.onExport === "function") {
                            const extension = FILE_EXTENSIONS[exportValues.format];
                            props.onExport({
                                filename: `${exportValues.filename}${extension}`,
                                background: false,
                                format: exportValues.format,
                                scale: exportValues.scale || 1,
                            });
                        }
                        app.state.showExport = false;
                        app.update();
                    }}
                />
            )}
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
};

FolioBoard.defaultProps = {
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
    showClearButton: true,
    showTitle: true,
    showLogo: true,
    onChange: null,
    onScreenshot: null,
    onExport: null,
    onMount: null,
    onLogoClick: null,
    onSettingsClick: null,
    onExportClick: null,
    onClearClick: null,
};

export default FolioBoard;
