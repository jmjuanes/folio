import React from "react";
import classNames from "classnames";
import {NoteIcon} from "@josemi-icons/react";
import {ELEMENTS, ACTIONS, FIELDS, FORM_OPTIONS} from "../constants.js";
import {SHAPES, ARROWHEADS, STROKE_WIDTHS} from "../constants.js";
import {STROKE_COLOR_PICK, TEXT_COLOR_PICK} from "../utils/colors.js";
import {HandGrabIcon, PointerIcon, ArrowIcon, TextIcon} from "./Icons.jsx";
import {PenIcon, ImageIcon} from "./Icons.jsx";
import {EraseIcon, LockIcon, UnlockIcon} from "./Icons.jsx";
import {SquareIcon, CircleIcon, TriangleIcon} from "./Icons.jsx";
import {LineIcon} from "./Icons.jsx";
import {WidthLargeIcon, WidthSmallIcon} from "./Icons.jsx";
import {Form} from "./Form.jsx";
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
        quickPicks: null,
    },
    [ELEMENTS.IMAGE]: {
        icon: (<ImageIcon />),
        text: "Image",
        quickPicks: null,
    },
};

const PickPanel = props => {
    const classList = classNames({
        "absolute left-half p-1 rounded-lg shadow-md bottom-full mb-4": true,
        "bg-white border border-gray-300": true, // props.theme === THEMES.LIGHT,
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
                    <div className="w-px h-6 bg-gray-300" />
                )}
                onChange={props.onChange}
            />
        </div>
    );
};

const Panel = props => {
    const panelWrapperClass = classNames(props.className, "absolute z-5 select-none");
    const panelContentClass = classNames({
        "border border-gray-300": true,
        "rounded-xl shadow-md items-center bg-white flex gap-2 p-2": true,
        // "flex-col": props.direction === "col",
    });

    return (
        <div className={panelWrapperClass} style={props.style} data-testid="toolspanel">
            <div className={panelContentClass}>
                {props.children}
            </div>
        </div>
    );
};

Panel.defaultProps = {
    className: "",
    style: {},
    direction: "row",
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
    <div className="bg-gray-300 w-px h-12" />
);

// Tools Panel component
export const ToolsPanel = props => {
    const update = useForceUpdate()[1];
    const board = useBoard();
    return (
        <Panel className={props.className} style={props.style}>
            <PanelButton
                testid="lock"
                className="w-8 rounded-full"
                icon={(board.lockTool ? <LockIcon /> : <UnlockIcon />)}
                active={board.lockTool}
                onClick={props.onLockToolClick}
            />
            <PanelSeparator />
            {/* Actions */}
            <PanelButton
                testid="drag"
                text="Drag"
                icon={(<HandGrabIcon />)}
                active={board.activeAction === ACTIONS.MOVE}
                onClick={props.onMoveClick}
            />
            <PanelButton
                testid="select"
                text="Select"
                icon={(<PointerIcon />)}
                active={!board.activeTool && board.activeAction !== ACTIONS.MOVE && board.activeAction !== ACTIONS.ERASE}
                onClick={props.onSelectionClick}
            />
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
            <PanelSeparator />
            <PanelButton
                testid="erase"
                text="Erase"
                icon={(<EraseIcon />)}
                active={board.activeAction === ACTIONS.ERASE}
                onClick={props.onEraseClick}
            />
        </Panel>
    );
};

ToolsPanel.defaultProps = {
    className: "", 
    style: {},
    onMoveClick: null,
    onSelectionClick: null,
    onEraseClick: null,
    onToolClick: null,
    onLockToolClick: null,
};
