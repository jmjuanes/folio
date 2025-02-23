import React from "react";
import classnames from "classnames";
import {Dropdown} from "./ui/dropdown.jsx";
import {Island} from "./island.jsx";
import {useEditor} from "../contexts/editor.jsx";
import {useConfirm} from "../contexts/confirm.jsx";
import {saveAsJson, loadFromJson} from "../json.js";

// @private menu link component
const MenuLinkItem = ({text, url}) => (
    <Dropdown.Item as="a" href={url} target="_blank">
        <Dropdown.Icon icon="external-link" />
        <span>{text}</span>
    </Dropdown.Item>
);

// @private menu dropdown item component
const MenuDropdownItem = props => (
    <Dropdown.Item className={props.className} disabled={!!props.disabled} onClick={props.onClick}>
        <Dropdown.Icon icon={props.icon} />
        <span>{props.text}</span>
    </Dropdown.Item>
);

export const Menu = () => {
    const {showConfirm} = useConfirm();
    const editor = useEditor();
    const elements = editor.getElements();

    // handle loading new data
    const handleLoad = React.useCallback(() => {
        const loadDrawing = () => {
            return loadFromJson()
                .then(data => {
                    editor.fromJSON(data);
                    // editor.state.welcomeVisible = false;
                    editor.dispatchChange();
                    editor.update();
                })
                .catch(error => console.error(error));
        };
        // Check if editor is empty
        if (editor.pages.length === 1 && editor.page.elements.length === 0) {
            return loadDrawing();
        }
        // If is not empty, display confirmation
        return showConfirm({
            title: "Load new drawing",
            message: "Changes made in this drawing will be lost. Do you want to continue?",
            callback: () => loadDrawing(),
        });
    }, []);

    // handle clear
    const handleClear = React.useCallback(() => {
        return showConfirm({
            title: "Delete all data",
            message: "This will delete all the information of this board, including all pages and drawings. Do you want to continue?",
            confirmText: "Yes, delete all data",
            callback: () => {
                editor.reset();
                editor.dispatchChange();
                editor.update();
            },
        });
    }, []);

    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button icon="bars" />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-56 z-40">
                <MenuDropdownItem
                    icon="folder"
                    text="Open..."
                    onClick={handleLoad}
                />
                <MenuDropdownItem
                    icon="download"
                    text="Save a copy"
                    onClick={() => {
                        saveAsJson(editor.toJSON())
                            .then(() => console.log("Folio file saved"))
                            .catch(error => console.error(error));
                    }}
                />
                <MenuDropdownItem
                    icon="image"
                    text="Export as image"
                    disabled={elements.length === 0}
                    className={classnames({
                        "pointer-events-none": elements.length === 0,
                    })}
                    onClick={() => {
                        console.log("export...");
                    }}
                />
                <MenuDropdownItem
                    icon="trash"
                    text="Reset"
                    disabled={elements.length === 0}
                    className={classnames({
                        "pointer-events-none": elements.length === 0,
                    })}
                    onClick={handleClear}
                />
                <Dropdown.Separator />
                <MenuDropdownItem
                    icon="tools"
                    text="Preferences"
                    onClick={null}
                />
            </Dropdown>
        </div>
    );
};
