import React from "react";
import classNames from "classnames";
import {SunIcon, ShapesIcon, PlusIcon, MinusIcon} from "@mochicons/react";
import {TextCenterIcon, TextLeftIcon, TextRightIcon, TextJustifyIcon} from "@mochicons/react";

import {COLORS, FIELDS} from "folio-core";
import {TEXT_SIZES, FONT_FACES, TEXT_ALIGNS} from "folio-core";
import {STROKES, STROKE_WIDTHS} from "folio-core";
import {OPACITY_MIN, OPACITY_MAX, OPACITY_STEP} from "folio-core";
import {BLUR_MAX, BLUR_MIN, BLUR_STEP} from "folio-core";
import {SHAPES} from "folio-core";
import {ARROWHEADS} from "folio-core";

import {useBoard} from "../contexts/BoardContext.jsx";
import {Form} from "./commons/Form.jsx";
import {CircleSolidIcon, CircleDashedIcon, CircleDottedIcon} from "./icons/index.jsx";
import {RectangleIcon, CircleIcon, TriangleIcon, DiamondIcon} from "./icons/index.jsx";
import {
    ArrowheadNoneIcon,
    ArrowheadArrowIcon,
    ArrowheadTriangleIcon,
    ArrowheadSquareIcon,
    ArrowheadCircleIcon,
} from "./icons/index.jsx";
import {FillIcon, StrokeIcon, TextIcon} from "./icons/index.jsx";
import { FORM_OPTIONS } from "../constants.js";

// Available tabs
const SECTIONS = {
    FILL: "fill",
    STROKE: "stroke",
    TEXT: "text",
    EFFECTS: "effects",
    ARROWHEADS: "arrowheads",
    SHAPE: "shape",
};

const arrowheadValues = [
    {value: ARROWHEADS.NONE, icon: ArrowheadNoneIcon()},
    {value: ARROWHEADS.ARROW, icon: ArrowheadArrowIcon()},
    {value: ARROWHEADS.TRIANGLE, icon: ArrowheadTriangleIcon()},
    {value: ARROWHEADS.SQUARE, icon: ArrowheadSquareIcon()},
    {value: ARROWHEADS.CIRCLE, icon: ArrowheadCircleIcon()},
    // {value: ARROWHEADS.SEGMENT, icon: ArrowheadSegmentIcon()},
];

const allOptions = {
    [SECTIONS.FILL]: {
        title: "Fill",
        icon: (<FillIcon />),
        test: FIELDS.FILL_COLOR,
        items: {
            fillColor: {
                type: FORM_OPTIONS.COLOR,
                title: "Fill Color",
                values: Object.values(COLORS),
            },
        },
    },
    [SECTIONS.STROKE]: {
        title: "Stroke",
        icon: (<StrokeIcon />),
        test: FIELDS.STROKE_COLOR,
        items: {
            strokeColor: {
                type: FORM_OPTIONS.COLOR,
                title: "Stroke color",
                values: Object.values(COLORS),
            },
            strokeWidth: {
                type: FORM_OPTIONS.SELECT,
                title: "Stroke Width",
                values: [
                    {value: STROKE_WIDTHS.SMALL, text: "S"},
                    {value: STROKE_WIDTHS.MEDIUM, text: "M"},
                    {value: STROKE_WIDTHS.LARGE, text: "L"},
                    {value: STROKE_WIDTHS.XLARGE, text: "XL"},
                ],
            },
            strokeStyle: {
                type: FORM_OPTIONS.SELECT,
                title: "Stroke Style",
                values: [
                    {value: STROKES.SOLID, icon: CircleSolidIcon()},
                    {value: STROKES.DASHED, icon: CircleDashedIcon()},
                    {value: STROKES.DOTTED, icon: CircleDottedIcon()},
                ],
            },
        },
    },
    [SECTIONS.TEXT]: {
        title: "Text",
        icon: (<TextIcon />),
        test: FIELDS.TEXT_COLOR,
        items: {
            textColor: {
                type: FORM_OPTIONS.COLOR,
                title: "Text Color",
                values: Object.values(COLORS),
            },
            textFont: {
                type: FORM_OPTIONS.FONT,
                title: "Text Font",
                values: Object.values(FONT_FACES),
            },
            textSize: {
                type: FORM_OPTIONS.SELECT,
                title: "Text Size",
                values: [
                    {value: TEXT_SIZES.SMALL, text: "S"},
                    {value: TEXT_SIZES.MEDIUM, text: "M"},
                    {value: TEXT_SIZES.LARGE, text: "L"},
                    {value: TEXT_SIZES.XLARGE, text: "XL"},
                ],
            },
            textAlign: {
                type: FORM_OPTIONS.SELECT,
                title: "Text Align",
                values: [
                    {value: TEXT_ALIGNS.LEFT, icon: TextLeftIcon()},
                    {value: TEXT_ALIGNS.CENTER, icon: TextCenterIcon()},
                    {value: TEXT_ALIGNS.RIGHT, icon: TextRightIcon()},
                    {value: TEXT_ALIGNS.JUSTIFY, icon: TextJustifyIcon()},
                ],
            },
        },
    },
    [SECTIONS.ARROWHEADS]: {
        title: "Arrowhead",
        test: FIELDS.START_ARROWHEAD,
        icon: (<ArrowheadArrowIcon />),
        items: {
            [FIELDS.START_ARROWHEAD]: {
                type: FORM_OPTIONS.SELECT,
                title: "Start Arrowhead",
                values: arrowheadValues,
            },
            [FIELDS.END_ARROWHEAD]: {
                type: FORM_OPTIONS.SELECT,
                title: "End Arrowhead",
                values: arrowheadValues,
            },
        },
    },
    [SECTIONS.SHAPE]: {
        title: "Shape",
        test: FIELDS.SHAPE,
        icon: (<ShapesIcon />),
        items: {
            [FIELDS.SHAPE]: {
                type: FORM_OPTIONS.SELECT,
                title: "Shape",
                values: [
                    {value: SHAPES.RECTANGLE, icon: RectangleIcon()},
                    {value: SHAPES.ELLIPSE, icon: CircleIcon()},
                    {value: SHAPES.DIAMOND, icon: DiamondIcon()},
                    {value: SHAPES.TRIANGLE, icon: TriangleIcon()},
                ],
            },
        },
    },
    [SECTIONS.EFFECTS]: {
        title: "Effects",
        icon: (<SunIcon />),
        test: FIELDS.OPACITY,
        items: {
            [FIELDS.OPACITY]: {
                type: FORM_OPTIONS.RANGE,
                title: "Opacity",
                minValue: OPACITY_MIN,
                maxValue: OPACITY_MAX,
                step: OPACITY_STEP,
            },
            [FIELDS.BLUR]: {
                type: FORM_OPTIONS.RANGE,
                title: "Blur",
                minValue: BLUR_MIN,
                maxValue: BLUR_MAX,
                step: BLUR_STEP,
            },
        },
    },
};

const TabsItem = props => {
    const classList = classNames({
        "w-full h-full rounded-md text-lg flex items-center justify-center": true,
        "bg-gray-800 text-white": props.active,
        "text-gray-800 cursor-pointer": !props.active && !props.disabled,
        "text-gray-400 cursor-not-allowed": !props.active && props.disabled,
    });
    return (
        <div className={classList} onClick={!props.disabled ? props.onClick : null}>
            {props.icon}
        </div>
    );
};

const SectionItem = props => {
    const [collapsed, setCollapsed] = React.useState(false);
    const classList = classNames({
        "flex items-center justify-between w-full p-4": true,
        "cursor-pointer": !props.disabled,
        "text-gray-500 cursor-not-allowed": props.disabled,
    });
    return (
        <React.Fragment>
            <div className="first:hidden w-full h-px bg-gray-300" />
            <div className={classList} onClick={() => !props.disabled && setCollapsed(!collapsed)}>
                <div className="flex items-center gap-2">
                    <div className="flex items-center text-lg">
                        {props.config.icon}
                    </div>
                    <div className="text-xs flex items-center">
                        <strong>{props.config.title}</strong>
                    </div>
                </div>
                <div className="flex items-center">
                    {collapsed ? <PlusIcon /> : <MinusIcon />}
                </div>
            </div>
            <div className={(collapsed || props.disabled) ? "hidden" : "px-4 pb-4"}>
                <Form
                    className="flex flex-col gap-2"
                    key={props.selection.length + (props.selection.length > 0 ? props.selection[0].id : "")}
                    data={props.values || {}}
                    items={props.config.items}
                    onChange={props.onChange}
                />
            </div>
        </React.Fragment>
    );
};

export const EditionPanel = props => {
    const board = useBoard();
    // const [activeTab, setActiveTab] = React.useState(SECTIONS.FILL);
    const selection = board.getSelectedElements();
    // TODO: we would need to compute common values for all elements in selection
    const values = selection.length === 1 ? selection[0] : (board.defaults || {});
    const keys = Object.keys(values);

    // Get the visible options in the dialog
    const visibleOptions = React.useMemo(
        () => {
            // If no keys are available, we will display all availabe options in this category
            if (keys.length === 0) {
                return new Set(Object.keys(allOptions));
            }
            // Filter options
            const visibleKeys = Object.keys(allOptions).filter(option => {
                return typeof values[allOptions[option].test] !== "undefined";
            });
            return new Set(visibleKeys);
        },
        [keys.length],
    );

    // Handle selection change
    const handleChange = (key, value) => {
        board.updateElements(selection, [key], [value], true);
        props?.onChange?.();
    };

    return (
        <div className={props.className} style={props.style}>
            <div className="bg-white border border-gray-300 w-48 rounded-xl shadow-md overflow-y-auto scrollbar h-full maxh-full">
                {Object.keys(allOptions).map(key => (
                    <SectionItem
                        key={key}
                        values={values}
                        config={allOptions[key]}
                        disabled={!visibleOptions.has(key)}
                        selection={selection}
                        onChange={handleChange}
                    />
                ))}
            </div>
        </div>
    );
};

EditionPanel.defaultProps = {
    className: "absolute z-6",
    style: {},
    onChange: null,
};
