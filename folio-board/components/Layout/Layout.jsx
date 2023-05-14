import React from "react";
import {ELEMENTS, FILE_EXTENSIONS} from "folio-core";
import {fileOpen} from "browser-fs-access";

import {ACTIONS} from "../../constants.js";
import {HistoryPanel, ZoomPanel, ToolsPanel} from "../Panels.jsx";
import {EditionPanel} from "../EditionPanel.jsx";
import {useBoard} from "../../contexts/BoardContext.jsx";
import {blobToDataUrl} from "../../utils/blob.js";

export const Layout = props => {
    const board = useBoard();
    const action = board.activeAction;

    // Handle image load
    const handleImageLoad = () => {
        const options = {
            description: "Folio Board",
            extensions: [
                FILE_EXTENSIONS.PNG,
                FILE_EXTENSIONS.JPG,
            ],
            multiple: false,
        };
        fileOpen(options)
            .then(blob => {
                if (!blob) {
                    return Promise.reject(new Error("No file selected"));
                }
                return blobToDataUrl(blob);
            })
            .then(data => board.addImage(data))
            .then(() => {
                props.onChange?.({
                    elements: board.elements,
                    assets: board.assets,
                });
            })
            .catch(error => console.error(error));
    };

    const isScreenshot = action === ACTIONS.SCREENSHOT;

    return (
        <React.Fragment>
            {!isScreenshot && props.tools && (
                <ToolsPanel
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
                            return handleImageLoad();
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
                    style={{
                        paddingBottom: props.footer ? props.footerHeight : null,
                    }}
                    onZoomInClick={() => {
                        board.zoomIn();
                    }}
                    onZoomOutClick={() => {
                        board.zoomOut();
                    }}
                />
            )}
            {!isScreenshot && (
                <EditionPanel
                    style={{
                        paddingTop: props.header ? props.headerHeight : 0,
                    }}
                    onChange={() => {
                        board.update();
                        props.onChange?.({
                            elements: board.elements,
                        });
                    }}
                />
            )}
            {!isScreenshot && props.header && (
                <React.Fragment>
                    {!!props.headerLeftContent && (
                        <div className="position-absolute top-0 left-0 pt-4 pl-4 z-7">
                            {props.headerLeftContent}
                        </div>
                    )}
                    {!!props.headerRightContent && (
                        <div className="d-none position-absolute top-0 right-0 pt-4 pr-4 z-7">
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
