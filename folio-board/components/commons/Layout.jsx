import React from "react";
import {
    ELEMENTS,
    EXPORT_FORMATS,
    exportToClipboard,
    exportToFile,
} from "folio-core";

import {
    ACTIONS,
    DIALOGS,
    FONT_FACES,
} from "../../constants.js";
import {
    EditionPanel,
    HistoryPanel,
    ToolsPanel,
    ZoomPanel,
    MenuPanel,
} from "../Panels/index.jsx";
import {
    FillDialog,
    StrokeDialog,
    TextDialog,
    ShapeDialog,
    ArrowheadDialog,
} from "../Dialogs/index.jsx";
import {DefaultButton, SimpleButton} from "../Buttons/index.jsx";
import {ExportSidebar, MenuSidebar} from "../Sidebar/index.jsx";
import {
    DownloadIcon,
    CameraIcon,
} from "../icons/index.jsx";
import {useBoard} from "../../contexts/BoardContext.jsx";
import {blobToDataUrl} from "../../utils/blob.js";
import {formatDate} from "../../utils/date.js";

export const Layout = props => {
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const state = React.useRef({
        activeTool: null,
        activeAction: null,
        activeDialog: null,
        activeElement: null,
        // activeGroup: null,
        // showSettings: false,
        showExport: false,
        showMenu: false,
    });
    const board = useBoard();
    const imageInputRef = React.useRef();
    const [exportValues, setExportValues] = React.useState({});
    // const app = useApp({
    //     onUpdate: forceUpdate,
    //     onScreenshot: region => {
    //         return exportToClipboard({
    //             elements: app.getElements(),
    //             fonts: Object.values(FONT_FACES),
    //             crop: region,
    //         });
    //     },
    // });

    // Register element change
    const handleElementChange = (key, value) => {
        board.current.updateElements(selectedElements, [key], [value], true);
        forceUpdate();
    };

    // Handle export button click
    const handleExportClick = () => {
        if (state.current.activeElement?.editing) {
            state.current.activeElement.editing = false;
        } 
        state.current.activeElement = null;
        state.current.activeAction = null;
        state.current.showExport = !state.current.showExport;
        state.current.showMenu = false;
        // state.current.showSettings = false;
        setExportValues({
            filename: `untitled-${formatDate()}`,
            background: false,
            format: EXPORT_FORMATS.PNG,
            scale: 1,
        });
    };

    // Handle screenshot button click
    const handleScreenshotClick = () => {
        // state.current.showSettings = false;
        state.current.showExport = false;
        state.current.showMenu = false;
        handleActionChange(ACTIONS.SCREENSHOT);
    };

    const handleActionChange = newAction => {
        board.current.clearSelectedElements();
        if (state.current.activeElement?.editing) {
            state.current.activeElement.editing = false;
        }
        state.current.activeElement = null;
        state.current.activeTool = null;
        state.current.activeAction = newAction;
        forceUpdate();
    };

    const handleToolChange = newTool => {
        board.current.clearSelectedElements();
        if (state.current.activeElement?.editing) {
            state.current.activeElement.editing = false;
        }
        state.current.activeElement = null;
        state.current.activeAction = null;
        state.current.activeTool = newTool;
        forceUpdate();
    };

    const action = state.current.activeAction;
    const selectedElements = board.current.getSelectedElements();

    // Force to reset the active dialog if there is an action or a tool active
    if (state.current.activeAction || state.current.activeTool) {
        state.current.activeDialog = null;
    }

    // Compute common values for selected elements to be used in dialogs
    let selectionValues = {}; // app.state.style || {};
    if (state.current.activeDialog && selectedElements.length > 0) {
        // TODO: we need to compute common values if length > 1
        if (selectedElements.length === 1) {
            selectionValues = selectedElements[0];
        }
    }
    const isScreenshot = action === ACTIONS.SCREENSHOT;

    return (
        <div className="d:flex flex:row w:full h:full">
            {state.current.showMenu && (
                <MenuSidebar
                    pages={props.pages || []}
                />
            )}
            <div className="position:relative overflow:hidden h:full w:full">
                {props.children}
                {!isScreenshot && (
                    <ToolsPanel
                        className="pt:20"
                        action={state.current.activeAction}
                        tool={state.current.activeTool}
                        onMoveClick={() => {
                            handleActionChange(ACTIONS.MOVE);
                        }}
                        onSelectionClick={() => {
                            handleToolChange(null);
                        }}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return imageInputRef.current.click();
                            }
                            handleToolChange(tool);
                        }}
                    />
                )}
                {!isScreenshot && (
                    <HistoryPanel
                        undoDisabled={board.current.isUndoDisabled()}
                        redoDisabled={board.current.isRedoDisabled()}
                        onUndoClick={() => {
                            if (state.current.activeElement?.editing) {
                                state.current.activeElement.editing = false;
                            }
                            state.current.activeAction = null;
                            state.current.activeElement = null;
                            board.current.undo();
                            forceUpdate();
                        }}
                        onRedoClick={() => {
                            if (state.current.activeElement?.editing) {
                                state.current.activeElement.editing = false;
                            }
                            state.current.activeAction = null;
                            state.current.activeElement = null;
                            board.current.redo();
                            forceUpdate();
                        }}
                    />
                )}
                {!isScreenshot && (
                    <ZoomPanel
                        zoom={board.current.zoom}
                        onZoomInClick={() => {
                            board.current.zoomIn();
                            forceUpdate();
                        }}
                        onZoomOutClick={() => {
                            board.current.zoomOut();
                            forceUpdate();
                        }}
                    />
                )}
                {!isScreenshot && (
                    <EditionPanel
                        key={updateKey}
                        className="pt:20"
                        elements={selectedElements}
                        dialog={state.current.activeDialog}
                        onRemoveClick={() => {
                            if (state.current.activeElement?.editing) {
                                state.current.activeElement.editing = false;
                                state.current.activeElement = null;
                            }
                            board.current.removeElements(selectedElements);
                            forceUpdate();
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
                            state.current.activeDialog = id;
                            forceUpdate();
                        }}
                    />
                )}
                {!action && !!state.current.activeDialog && selectedElements.length < 2 && (
                    <React.Fragment>
                        {state.current.activeDialog === DIALOGS.FILL && (
                            <FillDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.current.activeDialog === DIALOGS.STROKE && (
                            <StrokeDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.current.activeDialog === DIALOGS.TEXT && (
                            <TextDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.current.activeDialog === DIALOGS.SHAPE && (
                            <ShapeDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.current.activeDialog === DIALOGS.ARROWHEAD && (
                            <ArrowheadDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                    </React.Fragment>
                )}
                {!isScreenshot && (
                    <MenuPanel
                        title={props.title}
                        menuActive={!!state.current.showMenu}
                        showMenu={props.showMenuButton}
                        showSave={props.showSaveButtom}
                        showClear={props.showClearButton}
                        onMenuClick={() => {
                            state.current.showMenu = !state.current.showMenu;
                            forceUpdate();
                        }}
                        onClearClick={() => {
                            // TODO: we need to display a confirmation dialog
                            // app.reset();
                            forceUpdate();
                        }}
                        onSaveClick={() => {
                            // TODO
                        }}
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
                            {props.showExportButton && (
                                <DefaultButton text="Export" onClick={handleExportClick}>
                                    <DownloadIcon />
                                </DefaultButton>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {state.current.showExport && (
                <ExportSidebar
                    values={exportValues}
                    onClose={() => {
                        state.current.showExport = false;
                        forceUpdate();
                    }}
                    onChange={(key, value) => {
                        setExportValues(prevExportValues => ({
                            ...prevExportValues,
                            [key]: value,
                        }))
                    }}
                    onSubmit={() => {
                        const exportOptions = {
                            elements: board.current.getElements(),
                            fonts: Object.values(FONT_FACES),
                            filename: exportValues.filename,
                            format: exportValues.format || EXPORT_FORMATS.PNG,
                            // scale: exportValues.scale || 1,
                        };
                        exportToFile(exportOptions)
                            .then(() => {
                                console.log("Export completed");
                            })
                            .catch(error => {
                                console.error(error);
                            });
                        // Hide export dialog
                        state.current.showExport = false;
                        forceUpdate();
                    }}
                />
            )}
            {/* Image input reference */}
            <input
                ref={imageInputRef}    
                type="file"
                accept="image/*"
                onChange={event => {
                    const selectedFile = event.target.files?.[0];
                    if (selectedFile) {
                        blobToDataUrl(selectedFile).then(data => {
                            event.target.value = "";
                            board.current.addImage(data).then(() => {
                                forceUpdate();
                            });
                        });
                    }
                }}
                style={{
                    display: "none",
                    visibility: "hidden",
                }}
            />
        </div>
    );
};

FolioBoard.defaultProps = {
    boards: [],
    initialData: {},
    title: "",
    width: 0,
    height: 0,
    showZoom: true,
    showHistory: true,
    showTools: true,
    showEdition: true,
    showMenuButton: true,
    showExportButton: true,
    showScreenshotButton: true,
    showClearButton: true,
    showSaveButton: false,
    onChange: null,
    onMount: null,
    onCreateBoard: null,
    onUpdateBoard: null,
    onDeleteBoard: null,
};

Layout.defaultProps = {
    title: "",
    pages: [],
};
