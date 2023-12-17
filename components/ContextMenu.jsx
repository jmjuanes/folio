import React from "react";
import {ContextMenu as ContextMenuWrapper} from "@josemi-ui/components";
import {ContextMenuItem, ContextMenuSeparator} from "@josemi-ui/components";
import {useBoard} from "../contexts/BoardContext.jsx";

export const ContextMenu = props => {
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
    const x = board.state.contextMenuX;
    const y = board.state.contextMenuY;
    const style = {
        top: y,
        left: x,
        transform: y > board.state.canvasHeight / 2 ? "translateY(-100%)" : "",
    };
    const handleDuplicate = () => {
        board.state.contextMenuVisible = false;
        board.duplicate();
        props.onChange?.(board.export());
        board.update();
    };
    const handleLock = () => {
        board.lockElements(selectedElements);
        props.onChange?.(board.export());
        board.update();
    };
    const handleUnlock = () => {
        board.unlockElements(selectedElements);
        props.onChange?.(board.export());
        board.update();
    };
    const handleCut = () => {
        board.cut().then(() => {
            board.state.contextMenuVisible = false;
            props.onChange?.(board.export());
            board.update();
        });
    };
    const handleCopy = () => {
        board.copy().then(() => {
            board.state.contextMenuVisible = false;
            board.update();
        });
    };
    const handlePaste = () => {
        board.paste(null, {x, y}).then(() => {
            props.onChange?.(board.export());
            board.state.contextMenuVisible = false;
            board.update();
        });
    };
    const handleSendBackward = () => {
        board.sendSelectedElementsBackward();
        props.onChange?.(board.export());
        board.state.contextMenuVisible = false;
        board.update();
    };
    const handleBringForward = () => {
        board.bringSelectedElementsForward();
        props.onChange?.(board.export());
        board.state.contextMenuVisible = false;
        board.update();
    };
    const handleSelectAll = () => {
        board.selectAll();
        board.state.contextMenuVisible = false;
        board.update();
    };
    const handleDelete = () => {
        board.state.contextMenuVisible = false;
        board.remove();
        props.onChange?.(board.export());
        board.update();
    };
    return (
        <ContextMenuWrapper className="absolute z-10 w-40" style={style}>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem onClick={handleDuplicate}>Duplicate</ContextMenuItem>
                    {selectedElements.some(el => !el.locked) && (
                        <ContextMenuItem onClick={handleLock}>Lock</ContextMenuItem>
                    )}
                    {selectedElements.some(el => el.locked) && (
                        <ContextMenuItem onClick={handleUnlock}>Unlock</ContextMenuItem>
                    )}
                    <ContextMenuSeparator />
                </React.Fragment>
            )} 
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem onClick={handleCut}>Cut</ContextMenuItem>
                    <ContextMenuItem onClick={handleCopy}>Copy</ContextMenuItem>
                </React.Fragment>
            )}
            <ContextMenuItem onClick={handlePaste}>Paste</ContextMenuItem>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleSendBackward}>Send backward</ContextMenuItem>
                    <ContextMenuItem onClick={handleBringForward}>Bring forward</ContextMenuItem>
                </React.Fragment>
            )}
            {board.elements.length > 0 && (
                <React.Fragment>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleSelectAll}>Select all</ContextMenuItem>
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
                </React.Fragment>
            )} 
        </ContextMenuWrapper>
    );
};
