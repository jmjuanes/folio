import React from "react";
import {ELEMENTS} from "folio-core";

import {ACTIONS, DIALOGS} from "../../constants.js";
import {EditionPanel, HistoryPanel, ToolsPanel, ZoomPanel} from "../Panels/index.jsx";
import {FillDialog, StrokeDialog, TextDialog, ShapeDialog, ArrowheadDialog} from "../Dialogs/index.jsx";
import {FileInput} from "./FileInput.jsx";
import {useBoard} from "../../contexts/BoardContext.jsx";
import {isDialogEnabledForSelection} from "../../utils.js";

export const Layout = props => {
    const board = useBoard();
    const [dialog, setDialog] = React.useState(null);
    const imageInputRef = React.useRef();
    const prevSelectionCount = React.useRef(0);

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
        // if (!!dialog && (board.activeAction || board.activeTool)) {
        //     setDialog(null);
        // }
        // Hide if we have changed action or dialog is not available in selection
        if (dialog) {
            const hideDialog = !isDialogEnabledForSelection(dialog, selectedElements);
            const differentCount = prevSelectionCount.current !== selectedElements.length;
            if (board.activeAction || hideDialog || differentCount) {
                setDialog(null);
            }
        }
        prevSelectionCount.current = selectedElements.length;
    }, [tool, action, selectedElements.length]);

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
            {!isScreenshot && props.tools && (
                <ToolsPanel
                    action={board.activeAction}
                    tool={board.activeTool}
                    lockTool={board.lockTool}
                    style={{
                        paddingTop: props.header ? props.headerHeight : null,
                    }}
                    onMoveClick={() => {
                        board.setTool(null);
                        board.setAction(ACTIONS.MOVE);
                        board.update();
                    }}
                    onEraseClick={() => {
                        board.setTool(null);
                        board.setAction(ACTIONS.ERASE);
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
                    onLockToolClick={() => {
                        board.lockTool = !board.lockTool;
                        board.update();
                    }}
                />
            )}
            {!isScreenshot && props.history && (
                <HistoryPanel
                    undoDisabled={board.isUndoDisabled()}
                    redoDisabled={board.isRedoDisabled()}
                    style={{
                        paddingBottom: props.footer ? props.footerHeight : null,
                    }}
                    onUndoClick={() => {
                        board.undo();
                        props.onChange?.({
                            elements: board.elements,
                        });
                    }}
                    onRedoClick={() => {
                        board.redo();
                        props.onChange?.({
                            elements: board.elements,
                        });
                    }}
                />
            )}
            {!isScreenshot && props.zoom && (
                <ZoomPanel
                    zoom={board.zoom}
                    style={{
                        paddingBottom: props.footer ? props.footerHeight : null,
                    }}
                    onZoomInClick={() => {
                        board.zoomIn();
                        // props.onChange?.({
                        //     zoom: board.zoom,
                        //     translateX: board.translateX,
                        //     translateY: board.translateY,
                        // });
                    }}
                    onZoomOutClick={() => {
                        board.zoomOut();
                        // props.onChange?.({
                        //     zoom: board.zoom,
                        //     translateX: board.translateX,
                        //     translateY: board.translateY,
                        // });
                    }}
                />
            )}
            {!isScreenshot && props.edition && (
                <EditionPanel
                    elements={selectedElements}
                    group={board.activeGroup}
                    dialog={dialog}
                    style={{
                        paddingTop: props.header ? props.headerHeight : null,
                    }}
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
                    onGroupClick={() => {
                        board.groupSelectedElements();
                        board.update();
                        props.onChange?.({
                            elements: board.elements,
                        });
                    }}
                    onUngroupClick={() => {
                        board.ungroupSelectedElements();
                        board.update();
                        props.onChange?.({
                            elements: board.elements,
                        });
                    }}
                />
            )}
            {dialog && (
                <React.Fragment>
                    {dialog === DIALOGS.FILL && (
                        <FillDialog
                            values={selectionValues}
                            style={{
                                paddingTop: props.header ? props.headerHeight : 0,
                            }}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.STROKE && (
                        <StrokeDialog
                            values={selectionValues}
                            style={{
                                paddingTop: props.header ? props.headerHeight : 0,
                            }}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.TEXT && (
                        <TextDialog
                            values={selectionValues}
                            style={{
                                paddingTop: props.header ? props.headerHeight : 0,
                            }}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.SHAPE && (
                        <ShapeDialog
                            values={selectionValues}
                            style={{
                                paddingTop: props.header ? props.headerHeight : 0,
                            }}
                            onChange={handleElementChange}
                        />
                    )}
                    {dialog === DIALOGS.ARROWHEAD && (
                        <ArrowheadDialog
                            values={selectionValues}
                            style={{
                                paddingTop: props.header ? props.headerHeight : 0,
                            }}
                            onChange={handleElementChange}
                        />
                    )}
                </React.Fragment>
            )}
            {!isScreenshot && props.header && (
                <React.Fragment>
                    {!!props.headerLeftContent && (
                        <div className="position-absolute top-0 left-0 pt-4 pl-4 z-7">
                            {props.headerLeftContent}
                        </div>
                    )}
                    {!!props.headerRightContent && (
                        <div className="position-absolute top-0 right-0 pt-4 pr-4 z-7">
                            {props.headerRightContent}
                        </div>
                    )}
                </React.Fragment>
            )}
            {!isScreenshot && props.footer && (
                <div className="position-absolute bottom-0 left-0 pb-4 px-4 z-7 w-full">
                    {props.footerContent}
                </div>
            )}
            {/* Image input reference */}
            <FileInput
                ref={imageInputRef}
                accept="image/*"
                onFile={data => {
                    board.addImage(data).then(() => {
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
    header: false,
    headerHeight: "5rem",
    headerLeftContent: null,
    headerRightContent: null,
    footer: false,
    footerHeight: "3em",
    footerContent: null,
    zoom: true,
    history: true,
    tools: true,
    edition: true,
    onChange: null,
};
