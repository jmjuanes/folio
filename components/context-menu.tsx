import React from "react";
import { ChevronRightIcon } from "@josemi-icons/react";
import { ACTIONS, ELEMENTS, PREFERENCES } from "../constants.js";
import { ContextMenu as Menu } from "./ui/context-menu.tsx";
import { Dropdown, DropdownPortalPosition } from "./ui/dropdown.tsx";
import { useEditor } from "../contexts/editor.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useContextMenu, useContextMenuPosition } from "../hooks/use-context-menu.tsx";
import { useActions } from "../contexts/actions.tsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { printShortcut } from "../lib/actions.ts";

// Not allowed elements in library
const NOT_ALLOWED_ELEMENTS_IN_LIBRARY = [
    ELEMENTS.NOTE,
    ELEMENTS.BOOKMARK,
    ELEMENTS.STICKER,
    ELEMENTS.IMAGE,
];

export type ContextMenuItemProps = {
    icon: string;
    text: string;
    className?: string;
    expandable?: boolean;
    active?: boolean;
    disabled?: boolean;
    shortcut?: string | string[];
    onClick?: () => void;
};

// @private wrapper for the context menu items
export const ContextMenuItem = (props: ContextMenuItemProps): React.JSX.Element => (
    <Menu.Item active={props.active} className={props.className} disabled={!!props.disabled} onClick={props.onClick}>
        <Menu.Icon icon={props.icon} />
        <span>{props.text}</span>
        {(props.shortcut || props.expandable) && (
            <div className="flex items-center ml-auto">
                {props.shortcut && (
                    <Menu.Shortcut>{printShortcut(props.shortcut)}</Menu.Shortcut>
                )}
                {props.expandable && (
                    <div className="flex text-sm opacity-40">
                        <ChevronRightIcon />                        
                    </div>
                )}
            </div>
        )}
    </Menu.Item>
);

export const ContextMenuContent = (): React.JSX.Element => {
    const editor = useEditor();
    const preferences = usePreferences();
    const { dispatchAction, getShortcutByActionId } = useActions();
    const { Library } = useEditorComponents();
    const { hideContextMenu } = useContextMenu();
    const position = useContextMenuPosition();
    const selectedElements = editor.getSelection();
    const shortcutsEnabled = true;

    const addLibraryComponent = React.useMemo<boolean>(() => {
        return selectedElements.every((element: any) => {
            return !NOT_ALLOWED_ELEMENTS_IN_LIBRARY.includes(element.type);
        });
    }, [selectedElements.length]);

    return (
        <React.Fragment>
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <ContextMenuItem
                        icon="copy"
                        text="Duplicate"
                        shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.DUPLICATE_SELECTION) : ""}
                        onClick={() => {
                            dispatchAction(ACTIONS.DUPLICATE_SELECTION);
                            hideContextMenu();
                        }}
                    />
                    {selectedElements.some((el: any) => !el.locked) && (
                        <ContextMenuItem
                            icon="lock"
                            text="Lock"
                            shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.LOCK_SELECTION) : ""}
                            onClick={() => {
                                dispatchAction(ACTIONS.LOCK_SELECTION);
                            }}
                        />
                    )}
                    {selectedElements.some((el: any) => el.locked) && (
                        <ContextMenuItem
                            icon="unlock"
                            text="Unlock"
                            shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.UNLOCK_SELECTION) : ""}
                            onClick={() => {
                                dispatchAction(ACTIONS.UNLOCK_SELECTION);
                            }}
                        />
                    )}
                    {(!editor.page.activeGroup && selectedElements.length > 1) && (
                        <React.Fragment>
                            {selectedElements.some((el: any) => !el.group || el.group !== selectedElements[0].group) && (
                                <ContextMenuItem
                                    icon="object-group"
                                    text="Group"
                                    shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.GROUP_SELECTION) : ""}
                                    onClick={() => {
                                        dispatchAction(ACTIONS.GROUP_SELECTION);
                                    }}
                                />
                            )}
                            {selectedElements.some((el: any) => !!el.group) && (
                                <ContextMenuItem
                                    icon="object-ungroup"
                                    text="Ungroup"
                                    shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.UNGROUP_SELECTION) : ""}
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
            {selectedElements.length > 0 && !!Library && (
                <React.Fragment>
                    <ContextMenuItem
                        icon="album"
                        text="Add to library..."
                        disabled={!addLibraryComponent}
                        onClick={() => {
                            dispatchAction(ACTIONS.ADD_SELECTION_TO_LIBRARY);
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
                        shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.CUT) : ""}
                        onClick={() => {
                            dispatchAction(ACTIONS.CUT);
                            hideContextMenu();
                        }}
                    />
                    <ContextMenuItem
                        icon="copy"
                        text="Copy"
                        shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.COPY) : ""}
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
                shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.PASTE) : ""}
                onClick={() => {
                    if (position) {
                        dispatchAction(ACTIONS.PASTE, {
                            event: null,
                            position: {x: position.left, y: position.top},
                        });
                    }
                    hideContextMenu();
                }}
            />
            {selectedElements.length > 0 && (
                <React.Fragment>
                    <Menu.Separator />
                    <ContextMenuItem
                        icon="send-backward"
                        text="Send backward"
                        shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.SEND_BACKWARD) : ""}
                        onClick={() => {
                            dispatchAction(ACTIONS.SEND_BACKWARD);
                        }}
                    />
                    <ContextMenuItem
                        icon="bring-forward"
                        text="Bring forward"
                        shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.BRING_FORWARD) : ""}
                        onClick={() => {
                            dispatchAction(ACTIONS.BRING_FORWARD);
                        }}
                    />
                </React.Fragment>
            )}
            {selectedElements.length > 0 && preferences[PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_ENABLED] && (
                <React.Fragment>
                    <Menu.Separator />
                    <Dropdown.Portal
                        id="contextMenu:export"
                        position={DropdownPortalPosition.TOP_RIGHT}
                        toggleClassName="flex items-center w-full min-w-0"
                        contentClassName="absolute z-50 w-40"
                        contentStyle={{
                            transform: "translateX(100%)",
                        }}
                        toggleRender={(isActive) => (
                            <ContextMenuItem
                                className="grow-1"
                                active={isActive}
                                icon="image"
                                text="Export selection"
                                expandable={true}
                            />
                        )}
                        contentRender={() => (
                            <Dropdown className="w-full">
                                {preferences[PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_IMAGE] && (
                                    <ContextMenuItem
                                        icon="image"
                                        text="As PNG"
                                        onClick={() => {
                                            dispatchAction(ACTIONS.EXPORT_SELECTION_IMAGE, {
                                                includeBackground: !!preferences[PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_INCLUDE_BACKGROUND],
                                            });
                                            hideContextMenu();
                                        }}
                                    />
                                )}
                                {preferences[PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_CLIPBOARD] && (
                                    <ContextMenuItem
                                        icon="clipboard"
                                        text="To Clipboard"
                                        onClick={() => {
                                            dispatchAction(ACTIONS.EXPORT_SELECTION_CLIPBOARD, {
                                                includeBackground: !!preferences[PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_INCLUDE_BACKGROUND],
                                            });
                                            hideContextMenu();
                                        }}
                                    />
                                )}
                            </Dropdown>
                        )}
                    />
                </React.Fragment>
            )}
            {selectedElements.length !== editor.getElements().length && (
                <React.Fragment>
                    <Menu.Separator />
                    <ContextMenuItem
                        icon="box-selection"
                        text="Select all"
                        shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.SELECT_ALL) : ""}
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
                        shortcut={shortcutsEnabled ? getShortcutByActionId(ACTIONS.DELETE_SELECTION) : ""}
                        onClick={() => {
                            dispatchAction(ACTIONS.DELETE_SELECTION);
                            hideContextMenu();
                        }}
                    />
                </React.Fragment>
            )} 
        </React.Fragment>
    );
};

export type ContextMenuProps = {
    children?: React.ReactNode;
};

export const ContextMenu = (props: ContextMenuProps): React.JSX.Element => {
    const contextMenuContent = props.children ?? <ContextMenuContent />
    return (
        <Menu.Container className="w-48">
            {contextMenuContent}
        </Menu.Container>
    );
};
