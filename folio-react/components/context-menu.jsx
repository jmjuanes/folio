import React from "react";
import {ACTIONS, ELEMENTS} from "../constants.js";
import {ContextMenu as Menu} from "./ui/context-menu.jsx";
import {useEditor} from "../contexts/editor.jsx";
import {useContextMenu} from "../contexts/context-menu.jsx";
import {useDialog} from "../contexts/dialogs.jsx";
import {useActions} from "../hooks/use-actions.js";

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
    const dispatchAction = useActions();
    const {hideContextMenu} = useContextMenu();
    const {showDialog} = useDialog();
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
                            dispatchAction(ACTIONS.DUPLICATE_SELECTION);
                            hideContextMenu();
                        }}
                    />
                    {selectedElements.some(el => !el.locked) && (
                        <ContextMenuItem
                            icon="lock"
                            text="Lock"
                            onClick={() => {
                                dispatchAction(ACTIONS.LOCK_SELECTION);
                            }}
                        />
                    )}
                    {selectedElements.some(el => el.locked) && (
                        <ContextMenuItem
                            icon="unlock"
                            text="Unlock"
                            onClick={() => {
                                dispatchAction(ACTIONS.UNLOCK_SELECTION);
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
                                        dispatchAction(ACTIONS.GROUP_SELECTION);
                                    }}
                                />
                            )}
                            {selectedElements.some(el => !!el.group) && (
                                <ContextMenuItem
                                    icon="object-ungroup"
                                    text="Ungroup"
                                    onClick={() => {
                                        dispatchAction(ACTIONS.UNGROUP_SELECTION);
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
                            showDialog("library-add", {});
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
                            dispatchAction(ACTIONS.CUT);
                            hideContextMenu();
                        }}
                    />
                    <ContextMenuItem
                        icon="copy"
                        text="Copy"
                        onClick={() => {
                            dispatchAction(ACTIONS.COPY);
                            hideContextMenu();
                        }}
                    />
                </React.Fragment>
            )}
            <ContextMenuItem
                icon="clipboard"
                text="Paste"
                onClick={() => {
                    dispatchAction(ACTIONS.PASTE, {x: props.left, y: props.top});
                    hideContextMenu();
                }}
            />
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <ContextMenuItem
                        icon="send-backward"
                        text="Send backward"
                        onClick={() => {
                            dispatchAction(ACTIONS.SEND_BACKWARD);
                        }}
                    />
                    <ContextMenuItem
                        icon="bring-forward"
                        text="Bring forward"
                        onClick={() => {
                            dispatchAction(ACTIONS.BRING_FORWARD);
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
                            dispatchAction(ACTIONS.SELECT_ALL);
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
                            dispatchAction(ACTIONS.DELETE_SELECTION);
                            hideContextMenu();
                        }}
                    />
                </React.Fragment>
            )} 
        </Menu>
    );
};
