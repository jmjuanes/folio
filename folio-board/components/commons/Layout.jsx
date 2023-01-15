import React from "react";
import {
    ELEMENTS,
    EXPORT_FORMATS,
    exportToFile,
} from "folio-core";

import {
    ACTIONS,
    DEFAULT_BACKGROUND,
    DIALOGS,
    FONT_FACES,
} from "../../constants.js";
import {
    EditionPanel,
    HistoryPanel,
    ToolsPanel,
    ZoomPanel,
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
import {Title} from "./Title.jsx";
import {DownloadIcon, CameraIcon, MenuIcon, FolderIcon} from "../icons/index.jsx";
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
                    <div className="position:absolute top:0 right:0 pt:4 px:4 z:7 w:full">
                        <div className="d:grid cols:3 gap:3 pt:1 pb:1 w:full">
                            <div className="d:flex gap:3">
                                <SimpleButton
                                    icon={(<MenuIcon />)}
                                    active={state.showMenu}
                                    onClick={() => {
                                        state.showMenu = !state.showMenu;
                                        forceUpdate();
                                    }}
                                />
                                <DefaultButton
                                    text="Projects"
                                    icon={(<FolderIcon />)}
                                />
                            </div>
                            <div className="d:flex items:center justify:center">
                                <Title
                                    value={props.title}
                                    onChange={value => props?.onChange?.({title: value})}
                                />
                            </div>
                            <div className="d:flex flex:row-reverse gap:3">
                                <DefaultButton
                                    className="bg:dark-700 text:white"
                                    text="Export"
                                    icon={(<DownloadIcon />)}
                                    disabled={board.elements.length === 0}
                                    onClick={handleExportClick}
                                />
                                <SimpleButton
                                    icon={(<CameraIcon />)}
                                    disabled={board.elements.length === 0}
                                    onClick={handleScreenshotClick}
                                />
                            </div>
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
            {state.showMenu && (
                <Menu
                    className="top:0 left:0 pt:18 pl:4"
                    grid={props.grid}
                    background={props.background}
                    onChange={props.onChange}
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
    grid: false,
    background: DEFAULT_BACKGROUND,
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
