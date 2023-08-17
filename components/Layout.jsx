import React from "react";
import {fileOpen} from "browser-fs-access";
import {CameraIcon} from "@josemi-icons/react";

import {ELEMENTS, FILE_EXTENSIONS, ACTIONS, STATES} from "../constants.js";
import {ToolsPanel} from "./ToolsPanel.jsx";
import {EditionPanel} from "./EditionPanel.jsx";
import {useBoard} from "../contexts/BoardContext.jsx";
import {blobToDataUrl} from "../utils/blob.js";
import {Zooming} from "./Zooming.jsx";
import {History} from "./History.jsx";
import {SecondaryButton} from "./Button.jsx";

export const Layout = props => {
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
    const isScreenshot = board.activeAction === ACTIONS.SCREENSHOT;
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
            {props.showTools && !isScreenshot && (
                <ToolsPanel
                    style={{
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
            {props.showEdition && board.currentState === STATES.IDLE && selectedElements.length > 0 && (
                <EditionPanel
                    key={selectedElements.map(el => el.id).join("-")}
                    onChange={props.onChange}
                />
            )}
            {props.showHeader && !isScreenshot && (
                <React.Fragment>
                    <div className="absolute top-0 left-0 pt-4 pl-4 z-7">
                        <div className="flex gap-2">
                            {props.headerLeftContent}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 pt-4 pr-4 z-7">
                        <div className="flex gap-2">
                            {props.showScreenshot && (
                                <SecondaryButton
                                    icon={(<CameraIcon />)}
                                    disabled={board.elements.length === 0}
                                    onClick={() => {
                                        board.setTool(null);
                                        board.setAction(ACTIONS.SCREENSHOT);
                                        board.update();
                                    }}
                                />
                            )}
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
            {props.showFooter && !isScreenshot && (
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
    showScreenshot: true,
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
