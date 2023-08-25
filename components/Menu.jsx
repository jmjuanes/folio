import React from "react";
import {BACKGROUND_COLOR_PALETTE} from "../utils/colors.js";
import {useBoard} from "../contexts/BoardContext.jsx";
import {SecondaryButton} from "./Button.jsx";
import {ColorPicker} from "./ColorPicker.jsx";
import {Dropdown, DropdownSeparator, DropdownGroup} from "./Dropdown.jsx";
import {DropdownItem, DropdownCheckItem, DropdownLinkItem} from "./Dropdown.jsx";
import {BarsIcon, DownloadIcon, FolderIcon, TrashIcon, ImageIcon, GridIcon} from "./Icons.jsx";

export const Menu = props => {
    const board = useBoard();
    return (
        <div className="flex relative group" tabIndex="0">
            {/*
            <div className="cursor-pointer flex items-center bg-gray-900 rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center text-2xl text-white mr-3">
                    <BarsIcon />
                </div>
                <div className="flex items-center select-none font-crimson text-3xl leading-none">
                    <span className="font-black text-white leading-none">Folio.</span>
                </div>
            </div>
            */}
            <SecondaryButton
                icon={(<BarsIcon />)}
                text="Folio."
                textClassName="font-crimson text-2xl leading-none font-black tracking-tight"
            />
            <Dropdown className="hidden group-focus-within:block top-full left-0">
                <DropdownGroup title="Actions" />
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
                        onClick={props.onExport}
                    />
                )}
                {props.showResetBoard && (
                    <DropdownItem
                        icon={(<TrashIcon />)}
                        text="Reset the board"
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
                            text="Show Grid"
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
                        <ColorPicker
                            value={board.background}
                            values={Object.values(BACKGROUND_COLOR_PALETTE)}
                            collapseColorPalette={false}
                            onChange={newBackground => {
                                board.background = newBackground;
                                board.update();
                                props.onChange?.({
                                    background: board.background,
                                });
                            }}
                        />
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
    onChange: null,
    onSave: null,
    onResetBoard: null,
    onLoad: null,
    onExport: null,
};
