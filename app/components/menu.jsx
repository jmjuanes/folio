import React from "react";
import classnames from "classnames";
import {Dropdown} from "./ui/dropdown.jsx";
import {Island} from "./island.jsx";
import {useScene} from "../contexts/scene.jsx";

// @private menu link component
const MenuLink = ({text, url}) => (
    <Dropdown.Item as="a" href={url} target="_blank">
        <Dropdown.Icon icon="external-link" />
        <span>{text}</span>
    </Dropdown.Item>
);

export const Menu = props => {
    const scene = useScene();
    const elements = scene.getElements();
    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button icon="bars" />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-56 z-40">
                {props.showLoad && (
                    <Dropdown.Item onClick={props.onLoad}>
                        <Dropdown.Icon icon="folder" />
                        <span>Open...</span>
                    </Dropdown.Item>
                )}
                {props.showSave && (
                    <Dropdown.Item onClick={props.onSave}>
                        <Dropdown.Icon icon="download" />
                        <span>Save a copy</span>
                    </Dropdown.Item>
                )}
                {props.showExport && (
                    <Dropdown.Item
                        disabled={elements.length === 0}
                        className={classnames({
                            "pointer-events-none": elements.length === 0,
                        })}
                        onClick={props.onExport}
                    >
                        <Dropdown.Icon icon="image" />
                        <span>Export as image</span>
                    </Dropdown.Item>
                )}
                {props.showClear && (
                    <Dropdown.Item
                        disabled={elements.length === 0}
                        className={classnames({
                            "pointer-events-none": elements.length === 0,
                        })}
                        onClick={props.onClear}
                    >
                        <Dropdown.Icon icon="trash" />
                        <span>Reset the board</span>
                    </Dropdown.Item>
                )}
                <Dropdown.Separator />
                <Dropdown.Item onClick={props.onPreferences}>
                    <Dropdown.Icon icon="tools" />
                    <span>Preferences</span>
                </Dropdown.Item>
                {(props.links && props.links?.length > 0) && (
                    <React.Fragment>
                        <Dropdown.Separator />
                        {props.links.map(link => (
                            <MenuLink key={link.url} {...link} />
                        ))}
                    </React.Fragment>
                )}
            </Dropdown>
        </div>
    );
};
