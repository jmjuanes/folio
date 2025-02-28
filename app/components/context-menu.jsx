import React from "react";
import {ELEMENTS} from "../constants.js";
import {ContextMenu as Menu} from "./ui/context-menu.jsx";
import {useEditor} from "../contexts/editor.jsx";
import {useContextMenu} from "../contexts/context-menu.jsx";

// Not allowed elements in library
const NOT_ALLOWED_ELEMENTS_IN_LIBRARY = [
    ELEMENTS.LIBRARY_ITEM,
    ELEMENTS.NOTE,
    ELEMENTS.BOOKMARK,
    ELEMENTS.STICKER,
    ELEMENTS.IMAGE,
];

// @private wrapper for the context menu items
const ContextMenuItem = props => (
    <Menu.Item disabled={!!props.disabled} onClick={props.onClick}>
        <Menu.Icon icon={props.icon} />
        <span>{props.text}</span>
    </Menu.Item>
);

// @description context menu component
// @param {object} props React props
// @param {number} props.top Top position of the context menu
// @param {number} props.left Left position of the context menu
export const ContextMenu = props => {
    const editor = useEditor();
    const {hideContextMenu} = useContextMenu();
    const selectedElements = editor.getSelection();

    const contextMenuStyle = React.useMemo(() => {
        return {
            top: props.top,
            left: props.left,
            transform: props.top > editor.height / 2 ? "translateY(-100%)" : "",
        };
    }, [props.top, props.left, editor.height]);

    const addLibraryItem = React.useMemo(() => {
        return selectedElements.every(element => {
            return !NOT_ALLOWED_ELEMENTS_IN_LIBRARY.includes(element.type);
        });
    }, [selectedElements.length]);

    return (
        <Menu className="absolute z-40 w-48" style={contextMenuStyle}>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem
                        icon="copy"
                        text="Duplicate"
                        onClick={() => {
                            editor.duplicateElements(selectedElements);
                            editor.dispatchChange();
                            hideContextMenu();
                        }}
                    />
                    {selectedElements.some(el => !el.locked) && (
                        <ContextMenuItem
                            icon="lock"
                            text="Lock"
                            onClick={() => {
                                editor.lockElements(selectedElements);
                                editor.dispatchChange();
                                editor.update();
                            }}
                        />
                    )}
                    {selectedElements.some(el => el.locked) && (
                        <ContextMenuItem
                            icon="unlock"
                            text="Unlock"
                            onClick={() => {
                                editor.unlockElements(selectedElements);
                                editor.dispatchChange();
                                editor.update();
                            }}
                        />
                    )}
                    {(!editor.page.activeGroup && selectedElements.length > 1) && (
                        <React.Fragment>
                            {selectedElements.some(el => !el.group || el.group !== selectedElements[0].group) && (
                                <ContextMenuItem
                                    icon="object-group"
                                    text="Group"
                                    onClick={() => {
                                        editor.groupElements(selectedElements);
                                        editor.dispatchChange();
                                        editor.update();
                                    }}
                                />
                            )}
                            {selectedElements.some(el => !!el.group) && (
                                <ContextMenuItem
                                    icon="object-ungroup"
                                    text="Ungroup"
                                    onClick={() => {
                                        editor.ungroupElements(selectedElements);
                                        editor.dispatchChange();
                                        editor.update();
                                    }}
                                />
                            )}
                        </React.Fragment>
                    )}
                    <Menu.Separator />
                </React.Fragment>
            )} 
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem
                        icon="album"
                        text="Add to library..."
                        disabled={!addLibraryItem}
                        onClick={() => {
                            // editor.state.libraryAddVisible = true;
                            hideContextMenu();
                        }}
                    />
                    <Menu.Separator />
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem
                        icon="cut"
                        text="Cut"
                        onClick={() => {
                            editor.cutElementsToClipboard(selectedElements).then(() => {
                                editor.dispatchChange();
                                hideContextMenu();
                            });
                        }}
                    />
                    <ContextMenuItem
                        icon="copy"
                        text="Copy"
                        onClick={() => {
                            editor.copyElementsToClipboard(selectedElements).then(() => {
                                editor.dispatchChange();
                                hideContextMenu();
                            });
                        }}
                    />
                </React.Fragment>
            )}
            <ContextMenuItem
                icon="clipboard"
                text="Paste"
                onClick={() => {
                    editor.pasteElementsFromClipboard(null, {x: props.left, y: props.top}).then(() => {
                        editor.dispatchChange();
                        hideContextMenu();
                    });
                }}
            />
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <ContextMenuItem
                        icon="send-backward"
                        text="Send backward"
                        onClick={() => {
                            editor.sendElementsBackward(selectedElements);
                            editor.dispatchChange();
                            editor.update();
                        }}
                    />
                    <ContextMenuItem
                        icon="bring-forward"
                        text="Bring forward"
                        onClick={() => {
                            editor.bringElementsForward(selectedElements);
                            editor.dispatchChange();
                            editor.update();
                        }}
                    />
                </React.Fragment>
            )}
            {selectedElements.length !== editor.getElements().length && (
                <React.Fragment>
                    <Menu.Separator />
                    <ContextMenuItem
                        icon="box-selection"
                        text="Select all"
                        onClick={() => {
                            editor.getElements().forEach(el => el.selected = true);
                            hideContextMenu();
                        }}
                    />
                </React.Fragment>
            )}
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <ContextMenuItem
                        icon="trash"
                        text="Delete"
                        onClick={() => {
                            editor.removeElements(selectedElements);
                            editor.dispatchChange();
                            hideContextMenu();
                        }}
                    />
                </React.Fragment>
            )} 
        </Menu>
    );
};
