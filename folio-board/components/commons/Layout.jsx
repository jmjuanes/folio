import React from "react";
import {ELEMENTS, EXPORT_FORMATS} from "folio-core";

import {
    ACTIONS,
    DEFAULT_BACKGROUND,
    DIALOGS,
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
import {DefaultButton, SimpleButton} from "../Buttons/index.jsx";
import {Menu} from "./Menu.jsx";
import {Title} from "./Title.jsx";
import {DownloadIcon, CameraIcon, MenuIcon, FolderIcon} from "../icons/index.jsx";
import {useBoard} from "../../contexts/BoardContext.jsx";
import {blobToDataUrl} from "../../utils/blob.js";

export const Layout = props => {
    // const [updateKey, forceUpdate] = React.useReducer(x => x + 1, 0);
    const board = useBoard();
    const [dialog, setDialog] = React.useState(null);
    const [menuVisible, setMenuVisible] = React.useState(false);
    const imageInputRef = React.useRef();

    // Register element change
    const handleElementChange = (key, value) => {
        board.updateElements(selectedElements, [key], [value], true);
        board.update();
        props.onChange?.({
            elements: board.elements,
        });
    };

    const tool = board.activeTool;
    const action = board.activeAction;
    const selectedElements = board.getSelectedElements();

    // Force to reset the active dialog if there is an action or a tool active
    // if (board.activeAction || board.activeTool) {
    //     activeDialog.current = null;
    // }

    // Compute common values for selected elements to be used in dialogs
    let selectionValues = board.defaults || {};
    if (dialog && selectedElements.length > 0) {
        // TODO: we need to compute common values if length > 1
        if (selectedElements.length === 1) {
            selectionValues = selectedElements[0];
        }
    }
    const isScreenshot = action === ACTIONS.SCREENSHOT;

    return (
        <React.Fragment>
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
                    dialog={dialog}
                    onDialogClick={id => setDialog(id)}
                    onRemoveClick={() => {
                        board.setAction(null);
                        board.removeElements(selectedElements);
                        board.update();
                        props.onChange?.({
                            elements: board.elements,
                            assets: board.assets,
                        });
                    }}
                />
            )}
            {!action && !tool && !!dialog && selectedElements.length < 2 && (
                <React.Fragment>
                    {dialog === DIALOGS.FILL && (
                        <FillDialog
                            className="pt:20"
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.STROKE && (
                        <StrokeDialog
                            className="pt:20"
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.TEXT && (
                        <TextDialog
                            className="pt:20"
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.SHAPE && (
                        <ShapeDialog
                            className="pt:20"
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.ARROWHEAD && (
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
                                active={menuVisible}
                                onClick={() => setMenuVisible(visible => !visible)}
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
                                text="Export as PNG"
                                icon={(<DownloadIcon />)}
                                disabled={board.elements.length === 0}
                                onClick={() => {
                                    setMenuVisible(false);
                                    if (board.elements.length > 0) {
                                        props.onExport?.({
                                            format: EXPORT_FORMATS.PNG,
                                        });
                                    }
                                }}
                            />
                            <SimpleButton
                                icon={(<CameraIcon />)}
                                disabled={board.elements.length === 0}
                                onClick={() => {
                                    setMenuVisible(false);
                                    if (board.elements.length > 0) {
                                        board.setAction(ACTIONS.SCREENSHOT);
                                        board.update();
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {menuVisible && (
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
                        blobToDataUrl(selectedFile)
                            .then(data => {
                                event.target.value = "";
                                return board.addImage(data);
                            })
                            .then(() => {
                                props.onChange?.({
                                    elements: board.elements,
                                    assets: board.assets,
                                });
                            });
                    }
                }}
                style={{
                    display: "none",
                    visibility: "hidden",
                }}
            />
        </React.Fragment>
    );
};

Layout.defaultProps = {
    title: "",
    grid: false,
    background: DEFAULT_BACKGROUND,
    showZoom: true,
    showHistory: true,
    showTools: true,
    showEdition: true,
    showMenuButton: true,
    showExportButton: true,
    showScreenshotButton: true,
    onChange: null,
    onExport: null,
};
