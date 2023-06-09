import React from "react";
import {fileOpen} from "browser-fs-access";

import {ELEMENTS, FILE_EXTENSIONS, ACTIONS} from "../constants.js";
import {HistoryPanel, ZoomPanel, ToolsPanel} from "./Panels.jsx";
import {EditionPanel} from "./EditionPanel.jsx";
import {useBoard} from "../contexts/BoardContext.jsx";
import {blobToDataUrl} from "../utils/blob.js";

export const Layout = props => {
    const board = useBoard();
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

    return (
        <React.Fragment>
            {props.showTools && (
                <ToolsPanel
                    style={{
                        top: `calc(1rem + ${props.showHeader ? props.headerHeight : "0px"})`,
                        left: "1rem",
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
            {props.showHistory && (
                <HistoryPanel
                    style={{
                        bottom: "1rem",
                        left: "1rem",
                        // paddingBottom: props.showFooter ? props.footerHeight : null,
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
            {props.showZoom && (
                <ZoomPanel
                    style={{
                        bottom: "1rem",
                        right: "14rem",
                        // paddingBottom: props.showFooter ? props.footerHeight : null,
                    }}
                    onZoomInClick={() => {
                        board.zoomIn();
                    }}
                    onZoomOutClick={() => {
                        board.zoomOut();
                    }}
                />
            )}
            {props.showEdition && (
                <EditionPanel
                    style={{
                        top: "1rem",
                        right: "1rem",
                        bottom: "1rem",
                    }}
                    onChange={() => {
                        board.update();
                        props.onChange?.({
                            elements: board.elements,
                        });
                    }}
                />
            )}
            {props.showHeader && (
                <div className="absolute top-0 left-0 pt-4 pl-4 z-7">
                    {props.headerContent}
                </div>
            )}
            {props.showFooter && (
                <div className="absolute bottom-0 left-0 pb-4 px-4 z-7 w-full">
                    {props.footerContent}
                </div>
            )}
        </React.Fragment>
    );
};

Layout.defaultProps = {
    showHeader: false,
    showFooter: false,
    showZoom: true,
    showHistory: true,
    showTools: true,
    showEdition: true,
    headerHeight: "4rem",
    headerContent: null,
    footerHeight: "2rem",
    footerContent: null,
    onChange: null,
};
