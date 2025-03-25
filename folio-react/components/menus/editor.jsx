import React from "react";
import classnames from "classnames";
import {ACTIONS} from "../../constants.js";
import {Dropdown} from "../ui/dropdown.jsx";
import {Island} from "../ui/island.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useDialog} from "../../contexts/dialogs.jsx";
import {useActions} from "../../hooks/use-actions.js";
import {getShortcutByAction, printShortcut} from "../../lib/actions.js";

// @private menu link component
const MenuLinkItem = props => (
    <Dropdown.Item as="a" href={props.url} target="_blank">
        <Dropdown.Icon icon={props.icon || "external-link"} />
        <span>{props.text}</span>
    </Dropdown.Item>
);

// @private menu dropdown item component
const MenuDropdownItem = props => (
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

// @description export main editor menu
export const EditorMenu = () => {
    const {showDialog} = useDialog();
    const dispatchAction = useActions();
    const editor = useEditor();
    const elements = editor.getElements();

    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button icon="bars" />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-56 z-40">
                <MenuDropdownItem
                    icon="folder"
                    text="Open..."
                    shortcut={getShortcutByAction(ACTIONS.OPEN)}
                    onClick={() => {
                        dispatchAction(ACTIONS.OPEN);
                    }}
                />
                <MenuDropdownItem
                    icon="download"
                    text="Save a copy"
                    shortcut={getShortcutByAction(ACTIONS.SAVE)}
                    onClick={() => {
                        dispatchAction(ACTIONS.SAVE);
                    }}
                />
                <MenuDropdownItem
                    icon="image"
                    text="Export as image"
                    shortcut={getShortcutByAction(ACTIONS.EXPORT_IMAGE)}
                    disabled={elements.length === 0}
                    className={classnames({
                        "pointer-events-none": elements.length === 0,
                    })}
                    onClick={() => {
                        dispatchAction(ACTIONS.EXPORT_IMAGE, {elements});
                    }}
                />
                <MenuDropdownItem
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
                <Dropdown.Separator />
                <MenuDropdownItem
                    icon="tools"
                    text="Preferences"
                    onClick={() => {
                        showDialog("preferences");
                    }}
                />
                <MenuDropdownItem
                    icon="keyboard"
                    text="Keyboard shortcuts"
                    onClick={() => {
                        showDialog("keyboard-shortcuts");
                    }}
                />
                <Dropdown.Separator />
                <MenuLinkItem
                    url={process.env.URL_HOMEPAGE}
                    icon="info-circle"
                    text="About folio"
                />
                <MenuLinkItem
                    url={process.env.URL_ISSUES}
                    icon="bug"
                    text="Report an issue"
                />
                <MenuLinkItem
                    url={process.env.URL_REPOSITORY}
                    icon="code"
                    text="Source code"
                />
            </Dropdown>
        </div>
    );
};
