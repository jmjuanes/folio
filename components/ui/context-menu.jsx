import React from "react";
import {ContextMenu as Menu} from "@josemi-ui/react";
import {sceneActions} from "@lib/scene.js";

export const ContextMenu = ({editor, ...props}) => {
    const selectedElements = sceneActions.getSelection(editor.state);
    const style = {
        top: props.top,
        left: props.left,
        transform: props.top > props.canvasHeight / 2 ? "translateY(-100%)" : "",
    };
    return (
        <Menu className="absolute z-10 w-40" style={style}>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Item onClick={props.onDuplicate}>Duplicate</Menu.Item>
                    {selectedElements.some(el => !el.locked) && (
                        <Menu.Item onClick={props.onLock}>Lock</Menu.Item>
                    )}
                    {selectedElements.some(el => el.locked) && (
                        <Menu.Item onClick={props.onUnlock}>Unlock</Menu.Item>
                    )}
                    <Menu.Separator />
                </React.Fragment>
            )} 
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Item onClick={props.onCut}>Cut</Menu.Item>
                    <Menu.Item onClick={props.onCopy}>Copy</Menu.Item>
                </React.Fragment>
            )}
            <Menu.Item onClick={props.onPaste}>Paste</Menu.Item>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={props.onSendBackward}>Send backward</Menu.Item>
                    <Menu.Item onClick={props.onBringForward}>Bring forward</Menu.Item>
                </React.Fragment>
            )}
            {board.elements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={props.onSelectAll}>Select all</Menu.Item>
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={props.onDelete}>Delete</Menu.Item>
                </React.Fragment>
            )} 
        </Menu>
    );
};
