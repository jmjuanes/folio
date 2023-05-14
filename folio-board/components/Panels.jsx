import React from "react";
import classNames from "classnames";
import {EraseIcon, LockIcon, UnlockIcon} from "@mochicons/react";
import {ELEMENTS, ZOOM_MIN, ZOOM_MAX} from "folio-core";
import {ACTIONS} from "../constants.js";
import {useBoard} from "../contexts/BoardContext.jsx";
import {UndoIcon, RedoIcon} from "./icons/index.jsx";
import {ZoomInIcon, ZoomOutIcon} from "./icons/index.jsx";
import {HandGrabIcon, PointerIcon, RectangleIcon, ArrowIcon, TextIcon} from "./icons/index.jsx";
import {PenIcon, ImageIcon} from "./icons/index.jsx";

const Panel = props => {
    const panelWrapperClass = classNames(props.className, "position-absolute z-5 select-none");
    const panelContentClass = classNames({
        "b-1 b-solid b-gray-300": true,
        "r-lg shadow-md items-center bg-white d-flex gap-2 p-2": true,
        "flex-col": props.direction === "col",
    });

    return (
        <div className={panelWrapperClass} style={props.style}>
            <div className={panelContentClass}>
                {props.children}
            </div>
        </div>
    );
};

Panel.defaultProps = {
    className: "",
    style: {},
    direction: "row",
};

const PanelButton = props => {
    const classList = classNames(props.className, {
        "d-flex flex-col w-12 justify-center items-center r-md d-flex p-2 gap-1": true,
        "text-gray-800 bg-gray-800:hover text-white:hover cursor-pointer": !props.active && !props.disabled,
        "is-active bg-gray-800 text-white cursor-pointer": props.active && !props.disabled,
        "is-disabled text-gray-500 cursor-not-allowed o-60": !props.active && props.disabled,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon && (
                <div className="text-lg d-flex items-center">
                    {props.icon}
                </div>
            )}
            {props.text && (
                <div className="text-3xs">
                    <strong>{props.text}</strong>
                </div>
            )}
        </div>
    );
};

PanelButton.defaultProps = {
    className: "",
    text: null,
    icon: null,
    active: false,
    disabled: false,
};

const PanelSeparator = () => (
    <div className="bg-gray-300 w-12 h-px" />
);

// History panel component
export const HistoryPanel = props => {
    const board = useBoard();
    return (
        <Panel className={props.className} style={props.style}>
            <PanelButton
                icon={(<UndoIcon />)}
                disabled={board.isUndoDisabled()}
                onClick={props.onUndoClick}
            />
            <PanelButton
                icon={(<RedoIcon />)}
                disabled={board.isRedoDisabled()}
                onClick={props.onRedoClick}
            />
        </Panel>
    );
};

HistoryPanel.defaultProps = {
    className: "bottom-0 left-0 pb-4 pl-4",
    style: {},
    onUndoClick: null,
    onRedoClick: null,
};

// Zooming panel component
export const ZoomPanel = props => {
    const board = useBoard();
    return (
        <Panel className={props.className} style={props.style}>
            <PanelButton
                icon={(<ZoomOutIcon />)}
                disabled={board.zoom <= ZOOM_MIN}
                onClick={props.onZoomOutClick}
            />
            <div className="text-xs o-80 text-center w-16 select-none">
                {(board.zoom * 100).toFixed(0)}%
            </div>
            <PanelButton
                icon={(<ZoomInIcon />)}
                disabled={ZOOM_MAX <= board.zoom}
                onClick={props.onZoomInClick}
            />
        </Panel>
    );
};

ZoomPanel.defaultProps = {
    className: "bottom-0 right-0 pb-4 pr-4",
    style: {},
    onZoomInClick: null,
    onZoomOutClick: null,
};

// Tools Panel component
export const ToolsPanel = props => {
    const board = useBoard();
    return (
        <Panel direction="col" className={props.className} style={props.style}>
            <PanelButton
                className="w-full"
                icon={(props.lockTool ? <LockIcon /> : <UnlockIcon />)}
                active={board.lockTool}
                onClick={props.onLockToolClick}
            />
            <PanelSeparator />
            {/* Actions */}
            <PanelButton
                text="Drag"
                icon={(<HandGrabIcon />)}
                active={board.activeAction === ACTIONS.MOVE}
                onClick={props.onMoveClick}
            />
            <PanelButton
                text="Select"
                icon={(<PointerIcon />)}
                active={!board.activeTool && board.activeAction !== ACTIONS.MOVE && board.activeAction !== ACTIONS.ERASE}
                onClick={props.onSelectionClick}
            />
            <PanelSeparator />
            {/* Available tools */}
            <PanelButton
                text="Shape"
                icon={(<RectangleIcon />)}
                active={board.activeTool === ELEMENTS.SHAPE}
                onClick={() => props.onToolClick(ELEMENTS.SHAPE)}
            />
            <PanelButton
                text="Arrow"
                icon={(<ArrowIcon />)}
                active={board.activeTool === ELEMENTS.ARROW}
                onClick={() => props.onToolClick(ELEMENTS.ARROW)}
            />
            <PanelButton
                text="Text"
                icon={(<TextIcon />)}
                active={board.activeTool === ELEMENTS.TEXT}
                onClick={() => props.onToolClick(ELEMENTS.TEXT)}
            />
            <PanelButton
                text="Image"
                icon={(<ImageIcon />)}
                active={board.activeTool === ELEMENTS.IMAGE}
                onClick={() => props.onToolClick(ELEMENTS.IMAGE)}
            />
            <PanelSeparator />
            <PanelButton
                text="Draw"
                icon={(<PenIcon />)}
                active={board.activeTool === ELEMENTS.DRAW}
                onClick={() => props.onToolClick(ELEMENTS.DRAW)}
            />
            <PanelButton
                text="Erase"
                icon={(<EraseIcon />)}
                active={props.activeAction === ACTIONS.ERASE}
                onClick={props.onEraseClick}
            />
        </Panel>
    );
};

ToolsPanel.defaultProps = {
    className: "top-0 left-0 pt-4 pl-4", 
    style: {},
    onMoveClick: null,
    onSelectionClick: null,
    onEraseClick: null,
    onToolClick: null,
    onLockToolClick: null,
};
