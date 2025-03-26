import React from "react";
import {ACTIONS, ELEMENTS} from "../constants.js";
import {ContextMenu as Menu} from "./ui/context-menu.jsx";
import {useEditor} from "../contexts/editor.jsx";
import {useContextMenu} from "../contexts/context-menu.jsx";
import {useActions} from "../hooks/use-actions.js";
import {getShortcutByAction, printShortcut} from "../lib/actions.js";

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
        {props.shortcut && (
            <Menu.Shortcut>{printShortcut(props.shortcut)}</Menu.Shortcut>
        )}
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
                        shortcut={getShortcutByAction(ACTIONS.DUPLICATE_SELECTION)}
                        onClick={() => {
                            dispatchAction(ACTIONS.DUPLICATE_SELECTION);
                            hideContextMenu();
                        }}
                    />
                    {selectedElements.some(el => !el.locked) && (
                        <ContextMenuItem
                            icon="lock"
                            text="Lock"
                            shortcut={getShortcutByAction(ACTIONS.LOCK_SELECTION)}
                            onClick={() => {
                                dispatchAction(ACTIONS.LOCK_SELECTION);
                            }}
                        />
                    )}
                    {selectedElements.some(el => el.locked) && (
                        <ContextMenuItem
                            icon="unlock"
                            text="Unlock"
                            shortcut={getShortcutByAction(ACTIONS.UNLOCK_SELECTION)}
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
                                    shortcut={getShortcutByAction(ACTIONS.GROUP_SELECTION)}
                                    onClick={() => {
                                        dispatchAction(ACTIONS.GROUP_SELECTION);
                                    }}
                                />
                            )}
                            {selectedElements.some(el => !!el.group) && (
                                <ContextMenuItem
                                    icon="object-ungroup"
                                    text="Ungroup"
                                    shortcut={getShortcutByAction(ACTIONS.UNGROUP_SELECTION)}
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
                            dispatchAction(ACTIONS.SHOW_LIBRARY_ADD_DIALOG);
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
                        shortcut={getShortcutByAction(ACTIONS.CUT)}
                        onClick={() => {
                            dispatchAction(ACTIONS.CUT);
                            hideContextMenu();
                        }}
                    />
                    <ContextMenuItem
                        icon="copy"
                        text="Copy"
                        shortcut={getShortcutByAction(ACTIONS.COPY)}
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
                shortcut={getShortcutByAction(ACTIONS.PASTE)}
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
                        shortcut={getShortcutByAction(ACTIONS.SEND_BACKWARD)}
                        onClick={() => {
                            dispatchAction(ACTIONS.SEND_BACKWARD);
                        }}
                    />
                    <ContextMenuItem
                        icon="bring-forward"
                        text="Bring forward"
                        shortcut={getShortcutByAction(ACTIONS.BRING_FORWARD)}
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
                        shortcut={getShortcutByAction(ACTIONS.SELECT_ALL)}
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
                        shortcut={getShortcutByAction(ACTIONS.DELETE_SELECTION)}
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
