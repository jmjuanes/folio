import React from "react";
import classNames from "classnames";
import {TextCenterIcon, TextLeftIcon, TextRightIcon, TextJustifyIcon} from "@mochicons/react";

import {COLORS, FIELDS} from "folio-core";
import {TEXT_SIZES, FONT_FACES, TEXT_ALIGNS} from "folio-core";
import {STROKES, STROKE_WIDTHS} from "folio-core";
import {OPACITY_MIN, OPACITY_MAX, OPACITY_STEP} from "folio-core";
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

// Available tabs
const TABS = {
    FILL: "fill",
    STROKE: "stroke",
    TEXT: "text",
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
    [TABS.FILL]: {
        test: FIELDS.FILL_COLOR,
        items: {
            fillColor: {
                type: "color",
                title: "Fill Color",
                values: Object.values(COLORS),
            },
            fillOpacity: {
                type: "range",
                title: "Fill Opacity",
                minValue: OPACITY_MIN,
                maxValue: OPACITY_MAX,
                step: OPACITY_STEP,
            },
        },
    },
    [TABS.STROKE]: {
        test: FIELDS.STROKE_COLOR,
        items: {
            strokeColor: {
                type: "color",
                title: "Stroke color",
                values: Object.values(COLORS),
            },
            strokeWidth: {
                type: "select",
                title: "Stroke Width",
                values: [
                    {value: STROKE_WIDTHS.SMALL, text: "S"},
                    {value: STROKE_WIDTHS.MEDIUM, text: "M"},
                    {value: STROKE_WIDTHS.LARGE, text: "L"},
                    {value: STROKE_WIDTHS.XLARGE, text: "XL"},
                ],
            },
            strokeStyle: {
                type: "select",
                title: "Stroke Style",
                values: [
                    {value: STROKES.SOLID, icon: CircleSolidIcon()},
                    {value: STROKES.DASHED, icon: CircleDashedIcon()},
                    {value: STROKES.DOTTED, icon: CircleDottedIcon()},
                ],
            },
            strokeOpacity: {
                type: "range",
                title: "Stroke Opacity",
                minValue: OPACITY_MIN,
                maxValue: OPACITY_MAX,
                step: OPACITY_STEP,
            },
        },
    },
    [TABS.TEXT]: {
        test: FIELDS.TEXT_COLOR,
        items: {
            textColor: {
                type: "color",
                title: "Text Color",
                values: Object.values(COLORS),
            },
            textFont: {
                type: "font",
                title: "Text Font",
                values: Object.values(FONT_FACES),
            },
            textSize: {
                type: "select",
                title: "Text Size",
                values: [
                    {value: TEXT_SIZES.SMALL, text: "S"},
                    {value: TEXT_SIZES.MEDIUM, text: "M"},
                    {value: TEXT_SIZES.LARGE, text: "L"},
                    {value: TEXT_SIZES.XLARGE, text: "XL"},
                ],
            },
            textAlign: {
                type: "select",
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
};

const shapeOptions = {
    [FIELDS.SHAPE]: {
        type: "select",
        title: "Shape",
        values: [
            {value: SHAPES.RECTANGLE, icon: RectangleIcon()},
            {value: SHAPES.ELLIPSE, icon: CircleIcon()},
            {value: SHAPES.DIAMOND, icon: DiamondIcon()},
            {value: SHAPES.TRIANGLE, icon: TriangleIcon()},
        ],
    },
};

const arrowheadOptions = {
    [FIELDS.START_ARROWHEAD]: {
        type: "select",
        title: "Start Arrowhead",
        values: arrowheadValues,
    },
    [FIELDS.END_ARROWHEAD]: {
        type: "select",
        title: "End Arrowhead",
        values: arrowheadValues,
    },
};

const TabsItem = props => {
    const classList = classNames({
        "w-full h-full r-md text-lg d-flex items-center justify-center": true,
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

export const EditionPanel = props => {
    const board = useBoard();
    const [activeTab, setActiveTab] = React.useState(TABS.FILL);
    const selection = board.getSelectedElements();
    // TODO: we would need to compute common values for all elements in selection
    const values = selection.length === 1 ? selection[0] : (board.defaults || {});
    const keys = Object.keys(values);

    // Get the real visible tab
    const visibleTab = React.useMemo(
        () => {
            if (keys.length === 0 || typeof values[allOptions[activeTab].test] !== "undefined") {
                return activeTab;
            }
            // Get the first visible tab
            return Object.keys(allOptions).find(key => typeof values[allOptions[key].test] !== "undefined");
        },
        [keys.length, activeTab],
    );
    // Get the visible options in the dialog
    const visibleOptions = React.useMemo(
        () => {
            const options = allOptions[visibleTab].items;
            // If no keys are available, we will display all availabe options in this category
            if (keys.length === 0) {
                return options;
            }
            // Filter options
            const keysSet = new Set(keys);
            return Object.fromEntries(Object.entries(options).filter(entry => {
                return keysSet.has(entry[0]);
            }));
        },
        [keys.length, activeTab, visibleTab],
    );

    // Additional options
    const hasShapeOptions = keys.length === 0 || typeof values[FIELDS.SHAPE] !== "undefined";
    const hasArrowheadOptions = keys.length === 0 || typeof values[FIELDS.START_ARROWHEAD] !== "undefined";

    // Handle selection change
    const handleChange = (key, value) => {
        board.updateElements(selection, [key], [value], true);
        props?.onChange?.();
    };

    return (
        <div className={props.className} style={props.style}>
            <div className="bg-white z-5 b-1 b-solid b-gray-300 w-60 r-xl shadow-md overflow-y-auto scrollbar" style={{maxHeight: props.maxHeight}}>
                <div className="">
                    <div className="mx-4 pt-4 pb-2 bg-white position-sticky top-0">
                        <div className="w-full d-flex flex-no-wrap b-1 b-solid b-gray-300 r-md h-10">
                            <TabsItem
                                active={visibleTab === TABS.FILL}
                                disabled={keys.length > 0 && typeof values[allOptions[TABS.FILL].test] === "undefined"}
                                icon={(<FillIcon />)}
                                onClick={() => setActiveTab(TABS.FILL)}
                            />
                            <TabsItem
                                active={visibleTab === TABS.STROKE}
                                disabled={keys.length > 0 && typeof values[allOptions[TABS.STROKE].test] === "undefined"}
                                icon={(<StrokeIcon />)}
                                onClick={() => setActiveTab(TABS.STROKE)}
                            />
                            <TabsItem
                                active={visibleTab === TABS.TEXT}
                                disabled={keys.length > 0 && typeof values[allOptions[TABS.TEXT].test] === "undefined"}
                                icon={(<TextIcon />)}
                                onClick={() => setActiveTab(TABS.TEXT)}
                            />
                        </div>
                    </div>
                    <div className="px-4 pb-4 pt-2">
                        <Form
                            key={visibleTab + selection.length}
                            data={values || {}}
                            items={visibleOptions}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                {hasArrowheadOptions && (
                    <React.Fragment>
                        <div className="w-full h-px bg-gray-300" />
                        <div className="p-4">
                            <Form
                                data={values || {}}
                                items={arrowheadOptions}
                                onChange={handleChange}
                            />
                        </div>
                    </React.Fragment>
                )}
                {hasShapeOptions && (
                    <React.Fragment>
                        <div className="w-full h-px bg-gray-300" />
                        <div className="p-4">
                            <Form
                                data={values || {}}
                                items={shapeOptions}
                                onChange={handleChange}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

EditionPanel.defaultProps = {
    className: "position-absolute top-0 right-0 pt-4 pr-4",
    style: {},
    maxHeight: "calc(100vh - 8rem)",
    onChange: null,
};
