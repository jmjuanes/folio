import React from "react";
import classnames from "classnames";
import { ACTIONS } from "../../constants.js";
import { Dropdown } from "../ui/dropdown.jsx";
import { Island } from "../ui/island.jsx";
import { useEditor } from "../../contexts/editor.jsx";
import { useActions } from "../../hooks/use-actions.js";
import { getShortcutByAction, printShortcut } from "../../lib/actions.js";

export type MainMenuLinkProps = {
    url: string,
    icon?: string,
    text: string,
};

// wrapper to display links in the main menu
export const MainMenuLink = (props: MainMenuLinkProps): React.JSX.Element => (
    <Dropdown.Item as="a" href={props.url} target="_blank">
        <Dropdown.Icon icon={props.icon || "external-link"} />
        <span>{props.text}</span>
    </Dropdown.Item>
);

export type MainMenuActionProps = {
    className?: string,
    disabled?: boolean,
    text: string,
    icon?: string,
    shortcut?: string,
    onClick: (event: React.SyntheticEvent) => void,
};

// wrapper to display a button in the menu for an action
export const MainMenuAction = (props: MainMenuActionProps): React.JSX.Element => (
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
export const MainMenuSeparator = (): React.JSX.Element => (
    <Dropdown.Separator />
);

// menu links wrapper
export const MainMenuLinks = (): React.JSX.Element => (
    <React.Fragment>
        <MainMenuLink
            url={process.env.URL_HOMEPAGE}
            icon="info-circle"
            text="About folio"
        />
        <MainMenuLink
            url={process.env.URL_ISSUES}
            icon="bug"
            text="Report an issue"
        />
        <MainMenuLink
            url={process.env.URL_REPOSITORY}
            icon="code"
            text="Source code"
        />
    </React.Fragment>
);

// action to open a .folio file from the local computer of the user
export const MainMenuOpenAction = (): React.JSX.Element => {
    const dispatchAction = useActions();
    const shortcutsEnabled = true;
    return (
        <MainMenuAction
            icon="folder"
            text="Open..."
            shortcut={shortcutsEnabled && getShortcutByAction(ACTIONS.OPEN)}
            onClick={() => {
                dispatchAction(ACTIONS.OPEN);
            }}
        />
    );
};

// action to save the current content to a file
export const MainMenuSaveAction = (): React.JSX.Element => {
    const dispatchAction = useActions();
    const shortcutsEnabled = true;
    return (
        <MainMenuAction
            icon="download"
            text="Save a copy"
            shortcut={shortcutsEnabled && getShortcutByAction(ACTIONS.SAVE)}
            onClick={() => {
                dispatchAction(ACTIONS.SAVE);
            }}
        />
    );
};

// action to export the current page to an image
export const MainMenuExportAction = (): React.JSX.Element => {
    const dispatchAction = useActions();
    const editor = useEditor();
    const elements = editor.getElements();
    const shortcutsEnabled = true;
    return (
        <MainMenuAction
            icon="image"
            text="Export as image"
            shortcut={shortcutsEnabled && getShortcutByAction(ACTIONS.SHOW_EXPORT_DIALOG)}
            disabled={elements.length === 0}
            className={classnames({
                "pointer-events-none": elements.length === 0,
            })}
            onClick={() => {
                dispatchAction(ACTIONS.SHOW_EXPORT_DIALOG, {elements});
            }}
        />
    );
};

// action to remove the content of the board
export const MainMenuResetAction = (): React.JSX.Element => {
    const dispatchAction = useActions();
    const editor = useEditor();
    const elements = editor.getElements();
    return (
        <MainMenuAction
            icon="trash"
            text="Reset"
            disabled={elements.length === 0}
            className={classnames({
                "pointer-events-none": elements.length === 0,
            })}
            onClick={() => {
                dispatchAction(ACTIONS.CLEAR);
            }}
        />
    );
};

// action to display the shortcuts menu
export const MainMenuShowShortcutsAction = (): React.JSX.Element => (
    <MainMenuAction
        icon="keyboard"
        text="Keyboard shortcuts"
        onClick={() => {
            dispatchAction(ACTIONS.SHOW_KEYBOARD_SHORTCUTS_DIALOG);
        }}
    />
);

// @description default content of the main menu
export const MainMenuContent = (): React.JSX.Element => (
    <React.Fragment>
        <MainMenuOpenAction />
        <MainMenuSaveAction />
        <MainMenuExportAction />
        <MainMenuResetAction />
        <MainMenuSeparator />
        <MainMenuShowShortcutsAction />
        <MainMenuSeparator />
        <MainMenuLinks />
    </React.Fragment>
);

// props for the main menu component
export type MainMenuProps = {
    children?: React.Node,
};

// @description main menu component
export const MainMenu = (props: MainMenuProps): React.JSX.Element => {
    const content = props.children ?? <MainMenuContent />;

    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button icon="bars" />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-56 z-40">
                {content}
            </Dropdown>
        </div>
    );
};
