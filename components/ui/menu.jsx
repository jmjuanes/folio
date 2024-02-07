import React from "react";
import classnames from "classnames";
import {PresentationIcon, ExternalLinkIcon} from "@josemi-icons/react";
import {Dropdown} from "@josemi-ui/react";
import {BACKGROUND_COLOR_PALETTE} from "@lib/utils/colors.js";
import {ColorPicker} from "../commons/color-picker.jsx";
import {HeaderButton} from "../commons/header.jsx";
import {DownloadIcon, FolderIcon, TrashIcon, ImageIcon, GridIcon} from "../icons.jsx";
import {useScene} from "@contexts/scene.jsx";

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
                {props.showResetBoard && (
                    <Dropdown.Item
                        disabled={elements.length === 0}
                        className={classnames({
                            "pointer-events-none": elements.length === 0,
                        })}
                        onClick={props.onResetBoard}
                    >
                        <Dropdown.Icon>
                            <TrashIcon />
                        </Dropdown.Icon>
                        <span>Reset the board</span>
                    </Dropdown.Item>
                )}
                {props.showSettings && (
                    <React.Fragment>
                        <Dropdown.Separator />
                        <Dropdown.CheckItem
                            checked={!!props?.settings?.grid}
                            onClick={props.onGridToggle}
                        >
                            <Dropdown.Icon>
                                <GridIcon />
                            </Dropdown.Icon>
                            <span>Grid</span>
                        </Dropdown.CheckItem>
                        <Dropdown.CheckItem
                            checked={!!props?.settings?.presentationMode}
                            onClick={props.onPresentationToggle}
                        >
                            <Dropdown.Icon>
                                <PresentationIcon />
                            </Dropdown.Icon>
                            <span>Presentation mode</span>
                        </Dropdown.CheckItem>
                    </React.Fragment>
                )}
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
                {(props.showLinks && props.links?.length > 0) && (
                    <React.Fragment>
                        <Dropdown.Separator />
                        {props.links.map(link => (
                            <Dropdown.Item
                                key={link.url}
                                as="a"
                                href={link.url}
                                target="_blank"
                            >
                                <Dropdown.Icon>
                                    <ExternalLinkIcon />
                                </Dropdown.Icon>
                                <span>{link.text}</span>
                            </Dropdown.Item>
                        ))}
                    </React.Fragment>
                )}
            </Dropdown>
        </div>
    );
};

Menu.defaultProps = {
    links: [],
    showLoad: true,
    showResetBoard: true,
    showSettings: true,
    showChangeBackground: true,
    showLinks: true,
    showExport: true,
    onChange: null,
    onSave: null,
    onResetBoard: null,
    onLoad: null,
    onExport: null,
    onScreenshot: null,
};
