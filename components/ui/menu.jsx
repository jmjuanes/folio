import React from "react";
import classnames from "classnames";
import {
    ExternalLinkIcon,
    MagnetIcon,
    GridIcon,
    ImageIcon,
    DownloadIcon,
    FolderIcon,
    TrashIcon,
} from "@josemi-icons/react";
import {Dropdown} from "@josemi-ui/react";
import {BACKGROUND_COLOR_PALETTE} from "@lib/utils/colors.js";
import {ColorPicker} from "../commons/color-picker.jsx";
import {HeaderButton} from "../commons/header.jsx";
import {useScene} from "@contexts/scene.jsx";

// @private menu link component
const MenuLink = ({text, url}) => (
    <Dropdown.Item as="a" href={url} target="_blank">
        <Dropdown.Icon>
            <ExternalLinkIcon />
        </Dropdown.Icon>
        <span>{text}</span>
    </Dropdown.Item>
);

export const Menu = props => {
    const scene = useScene();
    const elements = scene.getElements();

    return (
        <div className="flex relative group" tabIndex="0">
            <HeaderButton
                className="group-focus-within:bg-neutral-100"
                icon="bars"
            />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-56 z-5">
                {props.showLoad && (
                    <Dropdown.Item onClick={props.onLoad}>
                        <Dropdown.Icon>
                            <FolderIcon />
                        </Dropdown.Icon>
                        <span>Open...</span>
                    </Dropdown.Item>
                )}
                {props.showSave && (
                    <Dropdown.Item onClick={props.onSave}>
                        <Dropdown.Icon>
                            <DownloadIcon />
                        </Dropdown.Icon>
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
                        <Dropdown.Icon>
                            <ImageIcon />
                        </Dropdown.Icon>
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
                        <Dropdown.Icon>
                            <TrashIcon />
                        </Dropdown.Icon>
                        <span>Reset the canvas</span>
                    </Dropdown.Item>
                )}
                <Dropdown.Separator />
                <Dropdown.CheckItem checked={!!scene?.appState?.grid} onClick={props.onGridChange}>
                    <Dropdown.Icon>
                        <GridIcon />
                    </Dropdown.Icon>
                    <span>Grid</span>
                </Dropdown.CheckItem>
                <Dropdown.CheckItem checked={!!scene?.appState?.snapToElements} onClick={props.onSnapToElementsChange}>
                    <Dropdown.Icon>
                        <MagnetIcon />
                    </Dropdown.Icon>
                    <span>Snap to elements</span>
                </Dropdown.CheckItem>
                {props.showChangeBackground && (
                    <React.Fragment>
                        <Dropdown.Separator />
                        <div className="text-xs px-2 pb-1 text-neutral-600 select-none">Background</div>
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
