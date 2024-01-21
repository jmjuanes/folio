import React from "react";
import {ContextMenu as Menu} from "@josemi-ui/react";
import {useBoard} from "@components/contexts/board.jsx";

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
        <Menu className="absolute z-10 w-40" style={style}>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Item onClick={handleDuplicate}>Duplicate</Menu.Item>
                    {selectedElements.some(el => !el.locked) && (
                        <Menu.Item onClick={handleLock}>Lock</Menu.Item>
                    )}
                    {selectedElements.some(el => el.locked) && (
                        <Menu.Item onClick={handleUnlock}>Unlock</Menu.Item>
                    )}
                    <Menu.Separator />
                </React.Fragment>
            )} 
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Item onClick={handleCut}>Cut</Menu.Item>
                    <Menu.Item onClick={handleCopy}>Copy</Menu.Item>
                </React.Fragment>
            )}
            <Menu.Item onClick={handlePaste}>Paste</Menu.Item>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={handleSendBackward}>Send backward</Menu.Item>
                    <Menu.Item onClick={handleBringForward}>Bring forward</Menu.Item>
                </React.Fragment>
            )}
            {board.elements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={handleSelectAll}>Select all</Menu.Item>
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={handleDelete}>Delete</Menu.Item>
                </React.Fragment>
            )} 
        </Menu>
    );
};
