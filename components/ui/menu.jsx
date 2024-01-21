import React from "react";
import classnames from "classnames";
import {PresentationIcon, ExternalLinkIcon} from "@josemi-icons/react";
import {Dropdown} from "@josemi-ui/react";
import {ACTIONS} from "@lib/constants.js";
import {BACKGROUND_COLOR_PALETTE} from "@lib/utils/colors.js";
import {useBoard} from "@components/contexts/board.jsx";
import {ColorPicker} from "@components/commons/color-picker.jsx";
import {HeaderButton, HeaderContainer} from "@components/commons/header.jsx";
import {DownloadIcon, FolderIcon, TrashIcon, ImageIcon, GridIcon} from "@components/icons.jsx";

export const Menu = props => {
    const board = useBoard();
    return (
        <div className="flex relative group" tabIndex="0">
            <HeaderContainer>
                <HeaderButton
                    className="group-focus-within:bg-neutral-100"
                    icon="bars"
                />
            </HeaderContainer>
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
                        disabled={board.elements.length === 0}
                        className={classnames({
                            "pointer-events-none": board.elements.length === 0,
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
                        disabled={board.elements.length === 0}
                        className={classnames({
                            "pointer-events-none": board.elements.length === 0,
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
                        <Dropdown.Group>Preferences</Dropdown.Group>
                        <Dropdown.CheckItem
                            checked={board.grid}
                            onClick={() => {
                                board.grid = !board.grid;
                                board.update();
                                props.onChange?.({
                                    grid: board.grid,
                                });
                            }}
                        >
                            <Dropdown.Icon>
                                <GridIcon />
                            </Dropdown.Icon>
                            <span>Grid</span>
                        </Dropdown.CheckItem>
                        <Dropdown.CheckItem
                            checked={board.state.presentationMode}
                            onClick={() => {
                                board.state.presentationMode = !board.state.presentationMode;
                                board.setTool(null);
                                board.setAction(ACTIONS.MOVE);
                                board.update();
                            }}
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
                        <Dropdown.Group>Background</Dropdown.Group>
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
                        <Dropdown.Separator />
                        <Dropdown.Group>Links</Dropdown.Group>
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
