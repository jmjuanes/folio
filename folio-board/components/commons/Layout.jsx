import React from "react";
import {ELEMENTS} from "folio-core";

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
import {FileInput} from "./FileInput.jsx";
import {useBoard} from "../../contexts/BoardContext.jsx";

export const Layout = props => {
    const board = useBoard();
    const [dialog, setDialog] = React.useState(null);
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
    React.useEffect(() => {
        if (!!dialog && (board.activeAction || board.activeTool)) {
            setDialog(null);
        }
    }, [tool, action]);

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
                    className={!!props.header ? "pt:20" : ""}
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
                    className={!!props.header ? "pt:20" : ""}
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
                            className={!!props.header ? "pt:20" : ""}
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.STROKE && (
                        <StrokeDialog
                            className={!!props.header ? "pt:20" : ""}
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.TEXT && (
                        <TextDialog
                            className={!!props.header ? "pt:20" : ""}
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.SHAPE && (
                        <ShapeDialog
                            className={!!props.header ? "pt:20" : ""}
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.ARROWHEAD && (
                        <ArrowheadDialog
                            className={!!props.header ? "pt:20" : ""}
                            values={selectionValues}
                            onChange={handleElementChange}
                        />
                    )}
                </React.Fragment>
            )}
            {!isScreenshot && !!props.header && (
                <div className="position:absolute top:0 right:0 pt:4 px:4 z:7 w:full">
                    {props.header}
                </div>
            )}
            {/* Image input reference */}
            <FileInput
                ref={imageInputRef}
                accept="image/*"
                onFile={(data, type) => {
                    board.addImage(data, type).then(() => {
                        props.onChange?.({
                            elements: board.elements,
                            assets: board.assets,
                        });
                    });
                }}
            />
        </React.Fragment>
    );
};

Layout.defaultProps = {
    grid: false,
    background: DEFAULT_BACKGROUND,
    header: null,
    showZoom: true,
    showHistory: true,
    showTools: true,
    showEdition: true,
    onChange: null,
};
