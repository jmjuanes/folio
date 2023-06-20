import React from "react";
import {fileOpen} from "browser-fs-access";

import {ELEMENTS, FILE_EXTENSIONS, ACTIONS} from "../constants.js";
import {ToolsPanel} from "./ToolsPanel.jsx";
import {EditionPanel} from "./EditionPanel.jsx";
import {useBoard} from "../contexts/BoardContext.jsx";
import {blobToDataUrl} from "../utils/blob.js";
import {Zooming} from "./Zooming.jsx";
import {History} from "./History.jsx";

export const Layout = props => {
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
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
                        // top: `calc(1rem + ${props.showHeader ? props.headerHeight : "0px"})`,
                        bottom: "1rem",
                        left: "50%",
                        transform: "translateX(-50%)",
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
            {props.showEdition && (selectedElements.length > 0 || board.activeTool) && (
                <EditionPanel
                    style={{
                        top: "5rem",
                        left: "1rem",
                        bottom: "6.5rem",
                        pointerEvents: "none",
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
                <React.Fragment>
                    <div className="absolute top-0 left-0 pt-4 pl-4 z-7">
                        <div className="flex gap-2">
                            {props.headerLeftContent}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 pt-4 pr-4 z-7">
                        <div className="flex gap-2">
                            {props.showHistory && (
                                <History
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
                                <Zooming
                                    onZoomInClick={() => board.zoomIn()}
                                    onZoomOutClick={() => board.zoomOut()}
                                />
                            )}
                            {props.headerRightContent}
                        </div>
                    </div>
                </React.Fragment>
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
    headerLeftContent: null,
    headerRightContent: null,
    footerHeight: "2rem",
    footerContent: null,
    onChange: null,
};
