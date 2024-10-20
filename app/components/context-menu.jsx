import React from "react";
import {ELEMENTS} from "../constants.js";
import {ContextMenu as Menu} from "./ui/context-menu.jsx";
import {useScene} from "../contexts/scene.jsx";
import {useLibraries} from "../contexts/libraries.jsx";

// Not allowed elements
const NOT_ALLOWED_ELEMENTS_IN_LIBRARY = [
    ELEMENTS.LIBRARY_ITEM,
    ELEMENTS.NOTE,
    ELEMENTS.BOOKMARK,
    ELEMENTS.STICKER,
    ELEMENTS.IMAGE,
];

export const ContextMenu = props => {
    const scene = useScene();
    const libraries = useLibraries();
    const selectedElements = scene.getSelection();
    const style = {
        top: props.top,
        left: props.left,
        transform: props.top > scene.height / 2 ? "translateY(-100%)" : "",
    };
    const addLibraryItem = React.useMemo(() => {
        // 1. check if user does not have any library or selected elements
        if (libraries.count() === 0 || selectedElements.length === 0) {
            return false;
        }
        // 2. check if user has all libraries as readonly
        if (libraries.getAll().every(library => library.readonly)) {
            return false;
        }
        // 3. check if selected elements are allowed to be added into library
        const hasNotAllowedElements = selectedElements.some(element => {
            return NOT_ALLOWED_ELEMENTS_IN_LIBRARY.includes(element.type);
        });
        return !hasNotAllowedElements;
    }, [selectedElements.length, libraries.count()]);
    return (
        <Menu className="absolute z-40 w-48" style={style}>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Item onClick={props.onDuplicate}>
                        <Menu.Icon icon="copy" />
                        <span>Duplicate</span>
                    </Menu.Item>
                    {selectedElements.some(el => !el.locked) && (
                        <Menu.Item onClick={props.onLock}>
                            <Menu.Icon icon="lock" />
                            <span>Lock</span>
                        </Menu.Item>
                    )}
                    {selectedElements.some(el => el.locked) && (
                        <Menu.Item onClick={props.onUnlock}>
                            <Menu.Icon icon="unlock" />
                            <span>Unlock</span>
                        </Menu.Item>
                    )}
                    {(!scene.page.activeGroup && selectedElements.length > 1) && (
                        <React.Fragment>
                            {selectedElements.some(el => !el.group || el.group !== selectedElements[0].group) && (
                                <Menu.Item onClick={props.onGroup}>
                                    <Menu.Icon icon="object-group" />
                                    <span>Group</span>
                                </Menu.Item>
                            )}
                            {selectedElements.some(el => !!el.group) && (
                                <Menu.Item onClick={props.onUngroup}>
                                    <Menu.Icon icon="object-ungroup" />
                                    <span>Ungroup</span>
                                </Menu.Item>
                            )}
                        </React.Fragment>
                    )}
                    <Menu.Separator />
                </React.Fragment>
            )} 
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Item disabled={!addLibraryItem} onClick={props.onAddToLibrary}>
                        <Menu.Icon icon="album" />
                        <span>Add to library...</span>
                    </Menu.Item>
                    <Menu.Separator />
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Item onClick={props.onCut}>
                        <Menu.Icon icon="cut" />
                        <span>Cut</span>
                    </Menu.Item>
                    <Menu.Item onClick={props.onCopy}>
                        <Menu.Icon icon="copy" />
                        <span>Copy</span>
                    </Menu.Item>
                </React.Fragment>
            )}
            <Menu.Item onClick={props.onPaste}>
                <Menu.Icon icon="clipboard" />
                <span>Paste</span>
            </Menu.Item>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={props.onSendBackward}>
                        <Menu.Icon icon="send-backward" />
                        <span>Send backward</span>
                    </Menu.Item>
                    <Menu.Item onClick={props.onBringForward}>
                        <Menu.Icon icon="bring-forward" />
                        <span>Bring forward</span>
                    </Menu.Item>
                </React.Fragment>
            )}
            {selectedElements.length !== scene.getElements().length && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={props.onSelectAll}>
                        <Menu.Icon icon="box-selection" />
                        <span>Select all</span>
                    </Menu.Item>
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <Menu.Item onClick={props.onDelete}>
                        <Menu.Icon icon="trash" />
                        <span>Delete</span>
                    </Menu.Item>
                </React.Fragment>
            )} 
        </Menu>
    );
};
