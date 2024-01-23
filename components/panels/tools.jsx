import React from "react";
import classNames from "classnames";
import {
    LockIcon,
    UnlockIcon,
    NoteIcon,
    ToolsIcon,
    EraseIcon,
    PenIcon,
    ImageIcon,
    TextIcon,
    PointerIcon,
    HandGrabIcon,
    SquareIcon,
    CircleIcon,
    TriangleIcon,
    DotsVerticalIcon,
} from "@josemi-icons/react";
import {Dropdown} from "@josemi-ui/react";
import {
    ELEMENTS,
    ACTIONS,
    FIELDS,
    FORM_OPTIONS,
    SHAPES,
    ARROWHEADS,
    STROKE_WIDTHS,
} from "@lib/constants.js";
import {
    STROKE_COLOR_PICK,
    TEXT_COLOR_PICK,
    NOTE_COLOR_PALETTE,
} from "@lib/utils/colors.js";
import {
    LaserPointerIcon,
    ArrowIcon,
    LineIcon,
    WidthLargeIcon,
    WidthSmallIcon,
} from "@components/icons.jsx";
import {Form} from "@components/commons/form.jsx";
import {useBoard} from "@components/contexts/board.jsx";
import {useForceUpdate} from "@lib/hooks/index.js";

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
    [ELEMENTS.IMAGE]: {
        icon: (<ImageIcon />),
        text: "Image",
        quickPicks: null,
    },
};

const PickPanel = props => {
    const classList = classNames({
        "absolute left-half p-1 rounded-lg shadow-md bottom-full mb-3": true,
        "bg-white border border-neutral-200": true, // props.theme === THEMES.LIGHT,
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
                    <div className="border-l-2 border-neutral-200 h-6" />
                )}
                onChange={props.onChange}
            />
        </div>
    );
};

const PanelButton = props => {
    const classList = classNames(props.className, {
        "flex flex-col justify-center items-center flex px-4 py-2 gap-1 rounded-lg": true,
        "text-neutral-800 hover:bg-neutral-100 cursor-pointer": !props.active,
        "bg-neutral-950 text-white cursor-pointer": props.active,
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
    className: "",
    text: null,
    icon: null,
    active: false,
};

const PanelSeparator = () => (
    <div className="bg-neutral-200 w-px h-12" />
);

const isSelectEnabled = a => {
    return a !== ACTIONS.MOVE && a !== ACTIONS.ERASE && a !== ACTIONS.POINTER;
};

// Tools Panel component
export const ToolsPanel = props => {
    const update = useForceUpdate()[1];
    const board = useBoard();
    return (
        <div className="flex items-center relative select-none">
            <div className="border border-neutral-200 rounded-xl shadow-md items-center bg-white flex gap-2 p-1">
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
                        <div className="flex self-stretch relative group" tabIndex="0">
                            <div className="flex items-center hover:bg-neutral-100 group-focus-within:bg-neutral-100 cursor-pointer rounded-lg px-1">
                                <div className="flex items-center text-xl">
                                    <DotsVerticalIcon />
                                </div>
                            </div>
                            <Dropdown className="hidden group-focus-within:block bottom-full right-0 mb-2 w-48 z-5">
                                <Dropdown.CheckItem
                                    checked={board.activeTool === ELEMENTS.NOTE}
                                    onClick={() => props.onToolClick(ELEMENTS.NOTE)}
                                >
                                    <Dropdown.Icon>
                                        <NoteIcon />
                                    </Dropdown.Icon>
                                    <span>Note</span>
                                </Dropdown.CheckItem>
                                <Dropdown.CheckItem
                                    checked={board.activeAction === ACTIONS.ERASE}
                                    onClick={props.onEraseClick}
                                >
                                    <Dropdown.Icon>
                                        <EraseIcon />
                                    </Dropdown.Icon>
                                    <span>Erase</span>
                                </Dropdown.CheckItem>
                            </Dropdown>
                        </div>
                    </React.Fragment>
                )}
            </div>
            {props.showLock && (
                <div
                    className={classNames({
                        "absolute left-full flex items-center cursor-pointer text-lg rounded-full p-2 ml-2": true,
                        "bg-neutral-950 text-white": board.lockTool,
                        "o-50 hover:o-100": !board.lockTool,
                    })}
                    onClick={props.onLockToolClick}
                >
                    {board.lockTool ? <LockIcon /> : <UnlockIcon />}
                </div>
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
