import React from "react";
import {ContextMenu as Menu} from "@josemi-ui/react";
import {useScene} from "@contexts/scene.jsx";

export const ContextMenu = props => {
    const scene = useScene();
    const selectedElements = scene.getSelection();
    const style = {
        top: props.top,
        left: props.left,
        transform: props.top > scene.height / 2 ? "translateY(-100%)" : "",
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
                    {(!scene.page.activeGroup && selectedElements.length > 1) && (
                        <React.Fragment>
                            {selectedElements.some(el => !el.group || el.group !== selectedElements[0].group) && (
                                <Menu.Item onClick={props.onGroup}>Group</Menu.Item>
                            )}
                            {selectedElements.some(el => !!el.group) && (
                                <Menu.Item onClick={props.onUngroup}>Ungroup</Menu.Item>
                            )}
                        </React.Fragment>
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
            {selectedElements.length > 0 && (
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
