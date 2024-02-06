import React from "react";
import {ContextMenu as Menu} from "@josemi-ui/react";
import {useScene} from "@contexts/scene.jsx";
import {useEditor} from "@contexts/editor.jsx";

export const ContextMenu = props => {
    const scene = useScene();
    const [editorState] = useEditor();

    const selectedElements = scene.getSelection();
    const style = {
        top: editorState.contextMenu.top,
        left: editorState.contextMenu.left,
        transform: editorState.contextMenu.top > scene.height / 2 ? "translateY(-100%)" : "",
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
