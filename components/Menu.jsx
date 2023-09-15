import React from "react";
import {BarsIcon} from "@josemi-icons/react";
import {BACKGROUND_COLOR_PALETTE} from "../utils/colors.js";
import {useBoard} from "../contexts/BoardContext.jsx";
import {ColorPicker} from "./ColorPicker.jsx";
import {Dropdown, DropdownSeparator, DropdownGroup} from "./Dropdown.jsx";
import {DropdownItem, DropdownCheckItem, DropdownLinkItem} from "./Dropdown.jsx";
import {DownloadIcon, FolderIcon, TrashIcon, ImageIcon, GridIcon} from "./Icons.jsx";

export const Menu = props => {
    const board = useBoard();
    return (
        <div className="flex relative group" tabIndex="0">
            <div className="cursor-pointer flex items-center gap-2 hover:bg-gray-200 group-focus-within:bg-gray-900 rounded-md py-1 px-2">
                <div className="flex items-center text-2xl text-gray-900 group-focus-within:text-white">
                    <BarsIcon />
                </div>
            </div>
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2">
                {props.showLoad && (
                    <DropdownItem
                        icon={(<FolderIcon />)}
                        text="Open..."
                        onClick={props.onLoad}
                    />
                )}
                {props.showSave && (
                    <DropdownItem
                        icon={(<DownloadIcon />)}
                        text="Save as..."
                        onClick={props.onSave}
                    />
                )}
                {props.showExport && (
                    <DropdownItem
                        icon={(<ImageIcon />)}
                        text="Export image..."
                        disabled={board.elements.length === 0}
                        onClick={props.onExport}
                    />
                )}
                {props.showResetBoard && (
                    <DropdownItem
                        icon={(<TrashIcon />)}
                        text="Reset the board"
                        disabled={board.elements.length === 0}
                        onClick={props.onResetBoard}
                    />
                )}
                {props.showSettings && (
                    <React.Fragment>
                        <DropdownSeparator />
                        <DropdownGroup title="Preferences" />
                        <DropdownCheckItem
                            active={board.grid}
                            icon={(<GridIcon />)}
                            text="Grid"
                            onClick={() => {
                                board.grid = !board.grid;
                                board.update();
                                props.onChange?.({
                                    grid: board.grid,
                                });
                            }}
                        />
                    </React.Fragment>
                )}
                {props.showChangeBackground && (
                    <React.Fragment>
                        <DropdownSeparator />
                        <DropdownGroup title="Background" />
                        <div className="px-3">
                            <ColorPicker
                                value={board.background}
                                values={BACKGROUND_COLOR_PALETTE}
                                collapseColorPalette={false}
                                onChange={newBackground => {
                                    board.background = newBackground;
                                    board.update();
                                    props.onChange?.({
                                        background: board.background,
                                    });
                                }}
                            />
                        </div>
                    </React.Fragment>
                )}
                {(props.showLinks && props.links?.length > 0) && (
                    <React.Fragment>
                        <DropdownSeparator />
                        <DropdownGroup title="Links" />
                        {props.links.map(link => (
                            <DropdownLinkItem
                                key={link.url}
                                url={link.url}
                                text={link.text}
                            />
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
    showScreenshot: true,
    onChange: null,
    onSave: null,
    onResetBoard: null,
    onLoad: null,
    onExport: null,
    onScreenshot: null,
};
