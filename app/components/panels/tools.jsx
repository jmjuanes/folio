import React from "react";
import classNames from "classnames";
import {useUpdate} from "react-use";
import {
    LockIcon,
    UnlockIcon,
    PenIcon,
    ImageIcon,
    TextIcon,
    PointerIcon,
    HandGrabIcon,
    SquareIcon,
    CircleIcon,
    TriangleIcon,
    DotsVerticalIcon,
    StickerIcon,
} from "@josemi-icons/react";
import {
    ELEMENTS,
    ACTIONS,
    FIELDS,
    SHAPES,
    ARROW_SHAPES,
    STICKERS,
    ARROWHEADS,
    STROKE_WIDTHS,
    FORM_OPTIONS,
} from "../../constants.js";
import {
    STROKE_COLOR_PICK,
    TEXT_COLOR_PICK,
} from "../../utils/colors.js";
import {
    ArrowIcon,
    ArrowConnectorIcon,
    WidthLargeIcon,
    WidthSmallIcon,
} from "../icons.jsx";
import {Dropdown} from "../ui/dropdown.jsx";
import {Form} from "../form/index.jsx";
import {useScene} from "../../contexts/scene.jsx";
import {themed} from "../../contexts/theme.jsx";
import {getStickerImage} from "../../stickers.js";

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
            // [FIELDS.END_ARROWHEAD]: {
            //     type: FORM_OPTIONS.SELECT,
            //     className: "flex flex-nowrap w-24 gap-1",
            //     isActive: (value, currentValue, data) => {
            //         return data[FIELDS.START_ARROWHEAD] === ARROWHEADS.NONE && value === currentValue;
            //     },
            //     values: [
            //         {value: ARROWHEADS.NONE, icon: <LineIcon />},
            //         {value: ARROWHEADS.ARROW, icon: <ArrowIcon />},
            //     ],
            // },
            [FIELDS.ARROW_SHAPE]: {
                type: FORM_OPTIONS.SELECT,
                className: "flex flex-nowrap w-24 gap-1",
                // isActive: (value, currentValue, data) => {
                //     return data[FIELDS.START_ARROWHEAD] === ARROWHEADS.NONE && value === currentValue;
                // },
                values: [
                    {value: ARROW_SHAPES.LINE, icon: <ArrowIcon />},
                    {value: ARROW_SHAPES.CONNECTOR, icon: <ArrowConnectorIcon />},
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
    [ELEMENTS.STICKER]: {
        icon: (<StickerIcon />),
        text: "Sticker",
        quickPicks: {
            [FIELDS.STICKER]: {
                type: FORM_OPTIONS.IMAGE_SELECT,
                className: "w-72 grid grid-cols-8 gap-1",
                values: Object.values(STICKERS).map(stickerName => ({
                    value: stickerName,
                    image: getStickerImage(stickerName),
                })),
            },
        },
    },
};

const PickPanel = props => (
    <div
        className={themed("absolute left-half p-1 rounded-lg shadow-md bottom-full mb-3", "toolbar.pick")}
        style={{
            transform: "translateX(-50%)",
        }}
    >
        <Form
            className="flex flex-row gap-2"
            data={props.values}
            items={props.items}
            separator={(
                <div className={themed("w-px h-6", "toolbar.pick.separator")} />
            )}
            onChange={props.onChange}
        />
    </div>
);

const PanelButton = props => {
    const classList = themed({
        "flex flex-col justify-center items-center flex px-4 py-2 gap-1 rounded-xl": true,
        "cursor-pointer": !props.active,
        "toolbar.button": true,
        "toolbar.button.active": props.active,
        "toolbar.button.inactive": !props.active,
    }, props.className);
    return (
        <div className={classList} onClick={props.onClick}>
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

const PanelSeparator = () => (
    <div className={themed("w-px h-12", "toolbar.separator")} />
);

const isSelectEnabled = a => {
    return a !== ACTIONS.MOVE && a !== ACTIONS.ERASE && a !== ACTIONS.POINTER;
};

// Tools Panel component
export const ToolsPanel = props => {
    const update = useUpdate();
    const scene = useScene();
    return (
        <div className="flex items-center relative select-none">
            <div className={themed("rounded-2xl items-center flex gap-2 p-1", "toolbar", props.className)}>
                <PanelButton
                    testid="drag"
                    text="Drag"
                    icon={(<HandGrabIcon />)}
                    active={props.action === ACTIONS.MOVE}
                    onClick={props.onMoveClick}
                />
                {props.showSelect && (
                    <PanelButton
                        testid="select"
                        text="Select"
                        icon={(<PointerIcon />)}
                        active={!props.tool && isSelectEnabled(props.action)}
                        onClick={props.onSelectionClick}
                    />
                )}
                {props.showTools && (
                    <React.Fragment>
                        <PanelSeparator />
                        {Object.keys(tools).map(key => (
                            <div key={key} className="flex relative">
                                <PanelButton
                                    testid={key}
                                    text={tools[key].text}
                                    icon={tools[key].icon}
                                    active={props.tool === key}
                                    onClick={() => props.onToolClick(key)}
                                />
                                {tools[key].quickPicks && key === props.tool && (
                                    <PickPanel
                                        values={scene.defaults}
                                        items={tools[key].quickPicks}
                                        onChange={(field, value) => {
                                            scene.defaults[field] = value;
                                            if (typeof tools[key].onQuickPickChange === "function") {
                                                tools[key].onQuickPickChange(scene.defaults, field, value);
                                            }
                                            // Force and update of the component
                                            update();
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                        <div className="flex self-stretch relative group" tabIndex="0">
                            <div className={themed("flex items-center cursor-pointer rounded-xl px-1", "toolbar.dots")}>
                                <div className="flex items-center text-xl">
                                    <DotsVerticalIcon />
                                </div>
                            </div>
                            <Dropdown className="hidden group-focus-within:block bottom-full right-0 mb-2 w-48 z-20">
                                <Dropdown.CheckItem checked={props.action === ACTIONS.POINTER} onClick={props.onPointerClick}>
                                    <Dropdown.Icon icon="laser-pointer" />
                                    <span>Laser Pointer</span>
                                </Dropdown.CheckItem>
                                <Dropdown.CheckItem
                                    checked={props.tool === ELEMENTS.NOTE}
                                    onClick={() => props.onToolClick(ELEMENTS.NOTE)}
                                >
                                    <Dropdown.Icon icon="note" />
                                    <span>Note</span>
                                </Dropdown.CheckItem>
                                <Dropdown.CheckItem
                                    checked={props.action === ACTIONS.ERASE}
                                    onClick={props.onEraseClick}
                                >
                                    <Dropdown.Icon icon="erase" />
                                    <span>Erase</span>
                                </Dropdown.CheckItem>
                            </Dropdown>
                        </div>
                    </React.Fragment>
                )}
            </div>
            {props.showLock && (
                <div
                    className={themed({
                        "absolute left-full flex items-center cursor-pointer text-lg rounded-full p-2 ml-2": true,
                        "toolbar.lock.active": props.toolLocked,
                        "toolbar.lock.inactive": !props.toolLocked,
                    })}
                    onClick={props.onToolLockClick}
                >
                    {props.toolLocked ? <LockIcon /> : <UnlockIcon />}
                </div>
            )}
        </div>
    );
};

ToolsPanel.defaultProps = {
    showTools: true,
    showLock: true,
    showSelect: true,
    onMoveClick: null,
    onSelectionClick: null,
    onPointerClick: null,
    onEraseClick: null,
    onToolClick: null,
    onToolLockClick: null,
};
