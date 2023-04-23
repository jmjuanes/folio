import React from "react";
import {BarsIcon, DownloadIcon, FolderIcon, TrashIcon} from "@mochicons/react";
import {ImageIcon, CodeIcon, CameraIcon} from "@mochicons/react";
import {GridIcon} from "@mochicons/react";
import {EXPORT_FORMATS, BACKGROUND_COLORS} from "folio-core";
import {ACTIONS} from "../constants.js";
import {BoardProvider, useBoard} from "../contexts/BoardContext.jsx";
import {Layout, Renderer, SecondaryButton} from "../components/commons/index.jsx";
import {Dropdown, DropdownSeparator, DropdownGroup} from "../components/commons/index.jsx";
import {DropdownItem, DropdownCheckItem, DropdownLinkItem} from "../components/commons/index.jsx";
import {ColorPicker} from "../components/Form/ColorPicker.jsx";
import {Welcome} from "../components/Layout/Welcome.jsx";

const BoardWrapper = props => {
    const board = useBoard();
    const [welcomeVisible, setWelcomeVisible] = React.useState(props.showWelcome && (board.elements.length === 0));

    return (
        <div className="position-relative overflow-hidden h-full w-full">
            <Renderer
                onChange={props.onChange}
                onScreenshot={props.onScreenshot}
            />
            <Layout
                header={true}
                headerLeftContent={(
                    <div className="d-flex gap-2">
                        <div className="d-flex position-relative group" tabIndex="0">
                            <SecondaryButton icon={(<BarsIcon />)} />
                            <Dropdown className="d-none d-block:group-focus-within top-full left-0">
                                <DropdownGroup title="Actions" />
                                {props.showLoadAction && (
                                    <DropdownItem
                                        icon={(<FolderIcon />)}
                                        text="Open..."
                                        onClick={props.onLoad}
                                    />
                                )}
                                {props.showOpenAction && (
                                    <DropdownItem
                                        icon={(<DownloadIcon />)}
                                        text="Save as..."
                                        onClick={props.onSave}
                                    />
                                )}
                                {props.showResetBoardAction && (
                                    <DropdownItem
                                        icon={(<TrashIcon />)}
                                        text="Reset the board"
                                        onClick={props.onReset}
                                    />
                                )}
                                {props.showBoardSettings && (
                                    <React.Fragment>
                                        <DropdownSeparator />
                                        <DropdownGroup title="Board Settings" />
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
                                            values={Object.values(BACKGROUND_COLORS)}
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
                        {props.customHeaderLeftContent}
                    </div>
                )}
                headerRightContent={(
                    <div className="d-flex gap-2">
                        {props.customHeaderRightContent}
                        {props.showScreenshot && (
                            <SecondaryButton
                                icon={(<CameraIcon />)}
                                disabled={board.elements.length === 0}
                                onClick={() => {
                                    if (board.elements.length > 0) {
                                        board.setAction(ACTIONS.SCREENSHOT);
                                        board.clearSelectedElements();
                                        board.update();
                                    }
                                }}
                            />
                        )}
                        {props.showExport && (
                            <div className="d-flex position-relative group" tabIndex="0">
                                <SecondaryButton
                                    icon={(<ImageIcon />)}
                                    text="Export"
                                    disabled={board.elements.length === 0}
                                />
                                <Dropdown className="d-none d-block:group-focus-within top-full right-0">
                                    <DropdownItem
                                        icon={(<ImageIcon />)}
                                        text="Export as PNG"
                                        disabled={board.elements.length === 0}
                                        onClick={() => props.onExport?.(EXPORT_FORMATS.PNG)}
                                    />
                                    <DropdownItem
                                        icon={(<CodeIcon />)}
                                        text="Export as SVG"
                                        disabled={board.elements.length === 0}
                                        onClick={() => props.onExport?.(EXPORT_FORMATS.SVG)}
                                    />
                                </Dropdown>
                            </div>
                        )}
                    </div>
                )}
                footer={false}
                onChange={props.onChange}
            />
            {welcomeVisible && (
                <Welcome
                    version={process.env.VERSION}
                    onClose={() => setWelcomeVisible(false)}
                    onLoad={props.onLoad}
                />
            )}
        </div>
    );
};

export const Board = props => (
    <BoardProvider
        initialData={props.initialData}
        render={() => ((
            <BoardWrapper {...props} />
        ))}
    />
);

Board.defaultProps = {
    initialData: {},
    links: [],
    customHeaderLeftContent: null,
    custonHeaderRightContent: null,
    onChange: null,
    onExport: null,
    onSave: null,
    onLoad: null,
    onReset: null,
    onScreenshot: null,
    showWelcome: true,
    showScreenshot: true,
    showExport: true,
    showLinks: true,
    showLoadAction: true,
    showOpenAction: true,
    showResetBoardAction: true,
    showBoardSettings: true,
    showChangeBackground: true,
};
