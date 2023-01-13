import React from "react";
import {
    ELEMENTS,
    EXPORT_FORMATS,
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
import {ExportModal} from "../Modals/index.jsx";
import {DefaultButton, SimpleButton} from "../Buttons/index.jsx";
import {Menu} from "./Menu.jsx";
import {DownloadIcon, CameraIcon} from "../icons/index.jsx";
import {useBoard} from "../../contexts/BoardContext.jsx";
import {useToasts} from "../../contexts/ToastContext.jsx";
import {blobToDataUrl} from "../../utils/blob.js";
import {formatDate} from "../../utils/date.js";

const useLayoutState = () => {
    const state = React.useRef({
        activeDialog: null,
        showExport: false,
        showMenu: false,
    });

    return state.current;
};

export const Layout = props => {
    const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const board = useBoard();
    const state = useLayoutState();
    const toasts = useToasts();
    const imageInputRef = React.useRef();
    const [exportValues, setExportValues] = React.useState({});

    // Register element change
    const handleElementChange = (key, value) => {
        board.updateElements(selectedElements, [key], [value], true);
        board.update();
    };

    // Handle export button click
    const handleExportClick = () => {
        if (board.elements.length === 0) {
            return null;
        }
        board.setAction(null);
        state.showExport = !state.showExport;
        state.showMenu = false;
        setExportValues({
            filename: `untitled-${formatDate()}`,
            background: false,
            format: EXPORT_FORMATS.PNG,
            scale: 1,
        });
    };

    // Handle screenshot button click
    const handleScreenshotClick = () => {
        if (board.elements.length === 0) {
            return null;
        }
        state.showExport = false;
        state.showMenu = false;
        board.setAction(ACTIONS.SCREENSHOT);
        board.update();
    };

    const action = board.activeAction;
    const selectedElements = board.getSelectedElements();

    // Force to reset the active dialog if there is an action or a tool active
    if (board.activeAction || board.activeTool) {
        state.activeDialog = null;
    }

    // Compute common values for selected elements to be used in dialogs
    let selectionValues = board.defaults || {};
    if (state.activeDialog && selectedElements.length > 0) {
        // TODO: we need to compute common values if length > 1
        if (selectedElements.length === 1) {
            selectionValues = selectedElements[0];
        }
    }
    const isScreenshot = action === ACTIONS.SCREENSHOT;

    return (
        <div className="d:flex flex:row w:full h:full">
            {state.showMenu && (
                <Menu />
            )}
            <div className="position:relative overflow:hidden h:full w:full">
                {props.children}
                {!isScreenshot && (
                    <ToolsPanel
                        className="pt:20"
                        action={board.activeAction}
                        tool={board.activeTool}
                        onMoveClick={() => {
                            board.setAction(ACTIONS.MOVE);
                            board.update();
                        }}
                        onSelectionClick={() => {
                            board.setTool(null);
                            board.update();
                        }}
                        onToolClick={tool => {
                            // Special action if the image tool is activated
                            if (tool === ELEMENTS.IMAGE) {
                                return imageInputRef.current.click();
                            }
                            board.setTool(tool);
                            board.update();
                        }}
                    />
                )}
                {!isScreenshot && (
                    <HistoryPanel
                        undoDisabled={board.isUndoDisabled()}
                        redoDisabled={board.isRedoDisabled()}
                        onUndoClick={() => board.undo()}
                        onRedoClick={() => board.redo()}
                    />
                )}
                {!isScreenshot && (
                    <ZoomPanel
                        zoom={board.zoom}
                        onZoomInClick={() => board.zoomIn()}
                        onZoomOutClick={() => board.zoomOut()}
                    />
                )}
                {!isScreenshot && (
                    <EditionPanel
                        key={updateKey}
                        className="pt:20"
                        elements={selectedElements}
                        dialog={state.activeDialog}
                        onRemoveClick={() => {
                            board.setAction(null);
                            board.removeElements(selectedElements);
                            board.update();
                        }}
                        onDialogClick={id => {
                            state.activeDialog = id;
                            forceUpdate();
                        }}
                    />
                )}
                {!action && !!state.activeDialog && selectedElements.length < 2 && (
                    <React.Fragment>
                        {state.activeDialog === DIALOGS.FILL && (
                            <FillDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.activeDialog === DIALOGS.STROKE && (
                            <StrokeDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.activeDialog === DIALOGS.TEXT && (
                            <TextDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.activeDialog === DIALOGS.SHAPE && (
                            <ShapeDialog
                                className="pt:20"
                                values={selectionValues}
                                onChange={handleElementChange}
                            />
                        )}
                        {state.activeDialog === DIALOGS.ARROWHEAD && (
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
                        menuActive={!!state.showMenu}
                        showMenu={props.showMenuButton}
                        showSave={props.showSaveButtom}
                        showClear={props.showClearButton}
                        onMenuClick={() => {
                            state.showMenu = !state.showMenu;
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
                {!isScreenshot && (
                    <div className="position:absolute top:0 right:0 pt:4 pr:4 z:5">
                        <div className="d:flex gap:3 pt:1 pb:1">
                            {props.showScreenshotButton && (
                                <SimpleButton
                                    icon={(<CameraIcon />)}
                                    disabled={board.elements.length === 0}
                                    onClick={handleScreenshotClick}
                                />
                            )}
                            {props.showExportButton && (
                                <DefaultButton
                                    text="Export"
                                    icon={(<DownloadIcon />)}
                                    disabled={board.elements.length === 0}
                                    onClick={handleExportClick}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
            {state.showExport && (
                <ExportModal
                    values={exportValues}
                    onClose={() => {
                        state.showExport = false;
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
                            elements: board.getElements(),
                            fonts: Object.values(FONT_FACES),
                            filename: exportValues.filename,
                            format: exportValues.format || EXPORT_FORMATS.PNG,
                            // scale: exportValues.scale || 1,
                        };
                        exportToFile(exportOptions)
                            .then(filename => {
                                toasts.add(`Board exported as '${filename}'`);
                            })
                            .catch(error => {
                                console.error(error);
                            });
                        // Hide export dialog
                        state.showExport = false;
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
                            board.addImage(data);
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

Layout.defaultProps = {
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
