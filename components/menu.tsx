import { Fragment } from "react";
import classnames from "classnames";
import { ACTIONS, PREFERENCES } from "../constants.ts";
import { Dropdown, useDropdownPortal } from "./ui/dropdown.tsx";
import { Island } from "./ui/island.tsx";
import { useEditor } from "../contexts/editor.tsx";
import { usePreferences } from "../contexts/preferences.tsx";
import { useEditorComponents } from "../contexts/editor-components.tsx";
import { useActions } from "../contexts/actions.tsx";
import { printShortcut } from "../lib/actions.ts";
import type { JSX, SyntheticEvent } from "react";

export type MenuLinkProps = {
    url: string,
    icon?: string,
    text: string,
};

// wrapper to display links in the main menu
export const MenuLink = (props: MenuLinkProps): JSX.Element => (
    <Dropdown.Item as="a" href={props.url} target="_blank">
        <Dropdown.Icon icon={props.icon || "external-link"} />
        <span>{props.text}</span>
    </Dropdown.Item>
);

export type MenuActionProps = {
    className?: string,
    disabled?: boolean,
    text: string,
    icon: string,
    shortcut?: string | string[],
    onClick: (event: SyntheticEvent) => void,
};

// wrapper to display a button in the menu for an action
export const MenuAction = (props: MenuActionProps): JSX.Element => (
    <Dropdown.Item className={props.className} disabled={!!props.disabled} onClick={props.onClick}>
        <Dropdown.Icon icon={props.icon} />
        <span>{props.text}</span>
        {props.shortcut && (
            <Dropdown.Shortcut>
                {printShortcut(props.shortcut)}
            </Dropdown.Shortcut>
        )}
    </Dropdown.Item>
);

// alias to Dropdown.Separator
export const MenuSeparator = (): JSX.Element => (
    <Dropdown.Separator />
);

// menu links wrapper
export const MenuLinks = (): JSX.Element => (
    <Fragment>
        <MenuLink
            url={process.env.URL_HOMEPAGE}
            icon="info-circle"
            text="About folio"
        />
        <MenuLink
            url={process.env.URL_ISSUES}
            icon="bug"
            text="Report an issue"
        />
        <MenuLink
            url={process.env.URL_REPOSITORY}
            icon="code"
            text="Source code"
        />
    </Fragment>
);

// action to open a .folio file from the local computer of the user
export const MenuOpenAction = (): JSX.Element => {
    const dropdown = useDropdownPortal();
    const { dispatchAction, getShortcutByActionId } = useActions();
    const shortcutsEnabled = true;
    return (
        <MenuAction
            icon="folder"
            text="Open..."
            shortcut={shortcutsEnabled && getShortcutByActionId(ACTIONS.OPEN)}
            onClick={() => {
                dropdown.close();
                dispatchAction(ACTIONS.OPEN);
            }}
        />
    );
};

// action to save the current content to a file
export const MenuSaveAction = (): JSX.Element => {
    const dropdown = useDropdownPortal();
    const { dispatchAction, getShortcutByActionId } = useActions();
    const shortcutsEnabled = true;
    return (
        <MenuAction
            icon="download"
            text="Save a copy"
            shortcut={shortcutsEnabled && getShortcutByActionId(ACTIONS.SAVE)}
            onClick={() => {
                dropdown.close();
                dispatchAction(ACTIONS.SAVE);
            }}
        />
    );
};

// action to export the current page to an image
export const MenuExportAction = (): JSX.Element => {
    const dropdown = useDropdownPortal();
    const { dispatchAction, getShortcutByActionId } = useActions();
    const editor = useEditor();
    const elements = editor.getElements();
    const shortcutsEnabled = true;
    return (
        <MenuAction
            icon="image"
            text="Export as image"
            shortcut={shortcutsEnabled && getShortcutByActionId(ACTIONS.SHOW_EXPORT_DIALOG)}
            disabled={elements.length === 0}
            className={classnames({
                "pointer-events-none": elements.length === 0,
            })}
            onClick={() => {
                dropdown.close();
                dispatchAction(ACTIONS.SHOW_EXPORT_DIALOG, { elements });
            }}
        />
    );
};

// action to remove the content of the board
export const MenuResetAction = (): JSX.Element => {
    const dropdown = useDropdownPortal();
    const { dispatchAction } = useActions();
    const editor = useEditor();
    const elements = editor.getElements();
    return (
        <MenuAction
            icon="trash"
            text="Reset"
            disabled={elements.length === 0}
            className={classnames({
                "pointer-events-none": elements.length === 0,
            })}
            onClick={() => {
                dropdown.close();
                dispatchAction(ACTIONS.CLEAR);
            }}
        />
    );
};

// action to display the shortcuts menu
export const MenuShowShortcutsAction = (): JSX.Element => {
    const dropdown = useDropdownPortal();
    const { dispatchAction } = useActions();
    return (
        <MenuAction
            icon="keyboard"
            text="Keyboard shortcuts"
            onClick={() => {
                dropdown.close();
                dispatchAction(ACTIONS.SHOW_KEYBOARD_SHORTCUTS_DIALOG);
            }}
        />
    );
};

// action to display the editor preferences dialog
export const MenuPreferencesAction = (): JSX.Element => {
    const dropdown = useDropdownPortal();
    const { dispatchAction } = useActions();
    return (
        <MenuAction
            icon="sliders"
            text="Preferences"
            onClick={() => {
                dropdown.close();
                dispatchAction(ACTIONS.SHOW_PREFERENCES_DIALOG);
            }}
        />
    );
};

// @description default content of the main menu
export const MenuContent = (): JSX.Element => {
    const preferences = usePreferences();
    const { Preferences } = useEditorComponents();
    return (
        <Fragment>
            <MenuOpenAction />
            <MenuSaveAction />
            <MenuExportAction />
            <MenuResetAction />
            {(!!preferences[PREFERENCES.KEYBOARD_SHORTCUTS_ENABLED] || !!Preferences) && (
                <Fragment>
                    <MenuSeparator />
                    {!!preferences[PREFERENCES.KEYBOARD_SHORTCUTS_ENABLED] && (
                        <MenuShowShortcutsAction />
                    )}
                    {!!Preferences && (
                        <MenuPreferencesAction />
                    )}
                </Fragment>
            )}
            <MenuSeparator />
            <MenuLinks />
        </Fragment>
    );
};

// props for the main menu component
export type MenuProps = {
    children?: React.ReactNode,
};

// @description main menu component
export const Menu = (props: MenuProps): JSX.Element => {
    const content = props.children ?? <MenuContent />;

    return (
        <div className="flex items-center justify-center h-full select-none">
            <Dropdown.Portal
                id="menu:options"
                position="bottom-left"
                toggleClassName="flex items-center"
                contentClassName="absolute z-50 mt-2 w-56"
                toggleRender={(active) => (
                    <Island.Button active={active} icon="bars" />
                )}
                contentRender={() => (
                    <Dropdown className="w-full">
                        {content}
                    </Dropdown>
                )}
            />
        </div>
    );
};
