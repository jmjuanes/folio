import React from "react";
import classnames from "classnames";
import {Dropdown} from "./ui/dropdown.jsx";
import {BACKGROUND_COLOR_PALETTE} from "../utils/colors.js";
import {Island} from "./island.jsx";
import {ColorPicker} from "./form/color-picker.jsx";
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
                        <span>Save as...</span>
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
                        <span>Export image...</span>
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
                        <span>Reset</span>
                    </Dropdown.Item>
                )}
                <Dropdown.Separator />
                <Dropdown.CheckItem checked={!!scene?.appState?.grid} onClick={props.onGridChange}>
                    <Dropdown.Icon icon="grid" />
                    <span>Grid</span>
                </Dropdown.CheckItem>
                <Dropdown.CheckItem checked={!!scene?.appState?.snapToElements} onClick={props.onSnapToElementsChange}>
                    <Dropdown.Icon icon="magnet" />
                    <span>Snap to elements</span>
                </Dropdown.CheckItem>
                <Dropdown.CheckItem checked={!!scene?.appState?.objectDimensions} onClick={props.onObjectDimensionsChange}>
                    <Dropdown.Icon icon="ruler-2" />
                    <span>Object dimensions</span>
                </Dropdown.CheckItem>
                {props.showChangeBackground && (
                    <React.Fragment>
                        <Dropdown.Separator />
                        <Dropdown.Label>Background</Dropdown.Label>
                        <div className="px-2">
                            <ColorPicker
                                value={scene.background}
                                values={BACKGROUND_COLOR_PALETTE}
                                collapseColorPalette={false}
                                onChange={props.onBackgroundChange}
                            />
                        </div>
                    </React.Fragment>
                )}
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

Menu.defaultProps = {
    links: [],
    showSave: true,
    showLoad: true,
    showClear: true,
    showChangeBackground: true,
    showExport: true,
    onSave: null,
    onClear: null,
    onLoad: null,
    onExport: null,
    onGridChange: null,
    onSnapToElementsChange: null,
    onBackgroundChange: null,
};
