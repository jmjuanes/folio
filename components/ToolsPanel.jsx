import React from "react";
import classNames from "classnames";
import {NoteIcon, ToolsIcon} from "@josemi-icons/react";
import {ELEMENTS, ACTIONS, FIELDS, FORM_OPTIONS} from "../constants.js";
import {SHAPES, ARROWHEADS, STROKE_WIDTHS} from "../constants.js";
import {STROKE_COLOR_PICK, TEXT_COLOR_PICK} from "../utils/colors.js";
import {NOTE_COLOR_PALETTE} from "../utils/colors.js";
import {HandGrabIcon, PointerIcon, ArrowIcon, TextIcon} from "./Icons.jsx";
import {PenIcon, ImageIcon} from "./Icons.jsx";
import {EraseIcon, LockIcon, UnlockIcon} from "./Icons.jsx";
import {SquareIcon, CircleIcon, TriangleIcon} from "./Icons.jsx";
import {LineIcon} from "./Icons.jsx";
import {WidthLargeIcon, WidthSmallIcon} from "./Icons.jsx";
import {LaserPointerIcon} from "./Icons.jsx";
import {Form} from "./Form.jsx";
import {Dropdown, DropdownItem} from "./Dropdown.jsx";
import {useBoard} from "../contexts/BoardContext.jsx";
import {useForceUpdate} from "../hooks/index.js";

const tools = {
    [ELEMENTS.SHAPE]: {
        icon: (<SquareIcon />),
        text: "Shape",
        quickPicks: {
            [FIELDS.SHAPE]: {
                type: FORM_OPTIONS.SELECT,
                className: "flex flex-nowrap w-32 gap-1",
                values: [
                    {value: SHAPES.RECTANGLE, icon: <SquareIcon />},
                    {value: SHAPES.ELLIPSE, icon: <CircleIcon />},
                    {value: SHAPES.TRIANGLE, icon: <TriangleIcon />},
                ],
            },
            [FIELDS.STROKE_COLOR]: {
                type: FORM_OPTIONS.COLOR_SELECT,
                className: "flex flex-nowrap w-48 gap-1",
                values: STROKE_COLOR_PICK,
            },
        },
    },
    [ELEMENTS.ARROW]: {
        icon: (<ArrowIcon />),
        text: "Arrow",
        quickPicks: {
            [FIELDS.END_ARROWHEAD]: {
                type: FORM_OPTIONS.SELECT,
                className: "flex flex-nowrap w-24 gap-1",
                isActive: (value, currentValue, data) => {
                    return data[FIELDS.START_ARROWHEAD] === ARROWHEADS.NONE && value === currentValue;
                },
                values: [
                    {value: ARROWHEADS.NONE, icon: <LineIcon />},
                    {value: ARROWHEADS.ARROW, icon: <ArrowIcon />},
                ],
            },
            [FIELDS.STROKE_WIDTH]: {
                type: FORM_OPTIONS.SELECT,
                className: "flex flex-nowrap w-24 gap-1",
                values: [
                    {value: STROKE_WIDTHS.MEDIUM, icon: <WidthSmallIcon />},
                    {value: STROKE_WIDTHS.XLARGE, icon: <WidthLargeIcon />},
                ],
            },
            [FIELDS.STROKE_COLOR]: {
                type: FORM_OPTIONS.COLOR_SELECT,
                className: "flex flex-nowrap w-48 gap-1",
                values: STROKE_COLOR_PICK,
            },
        },
        onQuickPickChange: (defaults, field, value) => {
            // Make sure that we remove the start arrowhead value
            if (field === FIELDS.END_ARROWHEAD) {
                defaults[FIELDS.START_ARROWHEAD] = ARROWHEADS.NONE;
            }
        },
    },
    [ELEMENTS.TEXT]: {
        icon: (<TextIcon />),
        text: "Text",
        quickPicks: {
            // [FIELDS.TEXT_SIZE]: {
            //     type: FORM_OPTIONS.SELECT,
            //     className: "flex flex-nowrap w-24 gap-1",
            //     values: [
            //         {value: TEXT_SIZES.MEDIUM, icon: <WidthSmallIcon />},
            //         {value: TEXT_SIZES.XLARGE, icon: <WidthLargeIcon />},
            //     ],
            // },
            [FIELDS.TEXT_COLOR]: {
                type: FORM_OPTIONS.COLOR_SELECT,
                className: "flex flex-nowrap w-48 gap-1",
                values: TEXT_COLOR_PICK,
            },
        },
    },
    [ELEMENTS.DRAW]: {
        icon: (<PenIcon />),
        text: "Draw",
        quickPicks: {
            [FIELDS.STROKE_WIDTH]: {
                type: FORM_OPTIONS.SELECT,
                className: "flex flex-nowrap w-24 gap-1",
                values: [
                    {value: STROKE_WIDTHS.MEDIUM, icon: <WidthSmallIcon />},
                    {value: STROKE_WIDTHS.XLARGE, icon: <WidthLargeIcon />},
                ],
            },
            [FIELDS.STROKE_COLOR]: {
                type: FORM_OPTIONS.COLOR_SELECT,
                className: "flex flex-nowrap w-48 gap-1",
                values: STROKE_COLOR_PICK,
            },
        },
    },
    [ELEMENTS.NOTE]: {
        icon: (<NoteIcon />),
        text: "Note",
        quickPicks: {
            [FIELDS.NOTE_COLOR]: {
                type: FORM_OPTIONS.COLOR_SELECT,
                className: "flex flex-nowrap w-56 gap-1",
                values: NOTE_COLOR_PALETTE,
            },
        },
    },
    [ELEMENTS.IMAGE]: {
        icon: (<ImageIcon />),
        text: "Image",
        quickPicks: null,
    },
};

const PickPanel = props => {
    const classList = classNames({
        "absolute left-half p-1 rounded-lg shadow-md bottom-full mb-3": true,
        "bg-white border-1 border-gray-900": true, // props.theme === THEMES.LIGHT,
        // "bg-gray-900": props.theme === THEMES.DARK,
    });
    const style = {
        transform: "translateX(-50%)",
    };
    return (
        <div className={classList} style={style} data-testid="pickpanel">
            <Form
                className="flex flex-row gap-2"
                data={props.values}
                items={props.items}
                separator={(
                    <div className="border-l-2 border-gray-600 h-6" />
                )}
                onChange={props.onChange}
            />
        </div>
    );
};

const PanelButton = props => {
    const classList = classNames(props.className, {
        "flex flex-col justify-center items-center flex px-4 py-2 gap-1": true,
        "text-gray-800 hover:bg-gray-800 hover:text-white cursor-pointer": !props.active && !props.disabled,
        "bg-gray-800 text-white cursor-pointer": props.active && !props.disabled,
        "text-gray-500 cursor-not-allowed o-60": !props.active && props.disabled,
    });
    return (
        <div className={classList} onClick={props.onClick} data-testid={props.testid}>
            {props.icon && (
                <div className="text-xl flex items-center">
                    {props.icon}
                </div>
            )}
            {props.text && (
                <div className="text-3xs">
                    <strong>{props.text}</strong>
                </div>
            )}
        </div>
    );
};

PanelButton.defaultProps = {
    testid: "",
    className: "rounded-lg",
    text: null,
    icon: null,
    active: false,
    disabled: false,
};

const PanelSeparator = () => (
    <div className="bg-gray-500 w-px h-12" />
);

const isSelectEnabled = a => {
    return a !== ACTIONS.MOVE && a !== ACTIONS.ERASE && a !== ACTIONS.POINTER;
};

// Tools Panel component
export const ToolsPanel = props => {
    const update = useForceUpdate()[1];
    const board = useBoard();
    return (
        <div data-testid="toolspanel" className="border-2 border-gray-900 rounded-xl shadow-md items-center bg-white flex gap-2 p-1 select-none">
            {props.showLock && (
                <React.Fragment>
                    <PanelButton
                        testid="lock"
                        className="w-8 rounded-full"
                        icon={(board.lockTool ? <LockIcon /> : <UnlockIcon />)}
                        active={board.lockTool}
                        onClick={props.onLockToolClick}
                    />
                    <PanelSeparator />
                </React.Fragment>
            )}
            {/* Actions */}
            {props.showPointer && (
                <PanelButton
                    testid="pointer"
                    text="Pointer"
                    icon={(<LaserPointerIcon />)}
                    active={board.activeAction === ACTIONS.POINTER}
                    onClick={props.onPointerClick}
                />
            )}
            <PanelButton
                testid="drag"
                text="Drag"
                icon={(<HandGrabIcon />)}
                active={board.activeAction === ACTIONS.MOVE}
                onClick={props.onMoveClick}
            />
            {props.showSelect && (
                <PanelButton
                    testid="select"
                    text="Select"
                    icon={(<PointerIcon />)}
                    active={!board.activeTool && isSelectEnabled(board.activeAction)}
                    onClick={props.onSelectionClick}
                />
            )}
            {props.showTools && (
                <React.Fragment>
                    <PanelSeparator />
                    {/* Available tools */}
                    {Object.keys(tools).map(key => (
                        <div key={key} className="flex relative">
                            <PanelButton
                                testid={key}
                                text={tools[key].text}
                                icon={tools[key].icon}
                                active={board.activeTool === key}
                                onClick={() => props.onToolClick(key)}
                            />
                            {tools[key].quickPicks && key === board.activeTool && (
                                <PickPanel
                                    values={board.defaults}
                                    items={tools[key].quickPicks}
                                    onChange={(field, value) => {
                                        board.defaults[field] = value;
                                        if (typeof tools[key].onQuickPickChange === "function") {
                                            tools[key].onQuickPickChange(board.defaults, field, value);
                                        }
                                        // Force and update of the component
                                        update();
                                    }}
                                />
                            )}
                        </div>
                    ))}
                    <div className="relative group" tabIndex="0">
                        <PanelButton
                            testid="more"
                            text="More"
                            icon={(<ToolsIcon />)}
                        />
                        <Dropdown className="hidden group-focus-within:block bottom-full right-0 mb-3">
                            <DropdownItem
                                icon={(<EraseIcon />)}
                                text="Erase"
                                active={board.activeAction === ACTIONS.ERASE}
                                onClick={props.onEraseClick}
                            />
                        </Dropdown>
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};

ToolsPanel.defaultProps = {
    showTools: true,
    showPointer: false,
    showLock: true,
    showSelect: true,
    onMoveClick: null,
    onSelectionClick: null,
    onPointerClick: null,
    onEraseClick: null,
    onToolClick: null,
    onLockToolClick: null,
};
