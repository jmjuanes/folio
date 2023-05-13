import React from "react";
import classNames from "classnames";
import {TextCenterIcon, TextLeftIcon, TextRightIcon, TextJustifyIcon} from "@mochicons/react";
import {ShapesIcon} from "@mochicons/react";

import {COLORS} from "folio-core";
import {TEXT_SIZES, FONT_FACES, TEXT_ALIGNS} from "folio-core";
import {STROKES, STROKE_WIDTHS} from "folio-core";
import {OPACITY_MIN, OPACITY_MAX, OPACITY_STEP} from "folio-core";
import {SHAPES} from "folio-core";
import {ARROWHEADS} from "folio-core";

import {EDITION_TABS} from "../constants.js";
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
import {
    StrokeIcon,
    TextIcon,
} from "./icons/index.jsx";


const arrowheadValues = [
    {value: ARROWHEADS.NONE, icon: ArrowheadNoneIcon()},
    {value: ARROWHEADS.ARROW, icon: ArrowheadArrowIcon()},
    {value: ARROWHEADS.TRIANGLE, icon: ArrowheadTriangleIcon()},
    {value: ARROWHEADS.SQUARE, icon: ArrowheadSquareIcon()},
    {value: ARROWHEADS.CIRCLE, icon: ArrowheadCircleIcon()},
    // {value: ARROWHEADS.SEGMENT, icon: ArrowheadSegmentIcon()},
];

const allOptions = {
    [EDITION_TABS.FILL]: {
        test: "fillColor",
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
            shape: {
                type: "select",
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
    [EDITION_TABS.STROKE]: {
        test: "strokeColor",
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
            startArrowhead: {
                type: "select",
                title: "Start Arrowhead",
                values: arrowheadValues,
            },
            endArrowhead: {
                type: "select",
                title: "End Arrowhead",
                values: arrowheadValues,
            },
        },
    },
    [EDITION_TABS.TEXT]: {
        test: "textColor",
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
    const [activeTab, setActiveTab] = React.useState(EDITION_TABS.FILL);
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
            const valuesKeys = new Set(Object.keys(values || {}));
            // If no keys are available, we will display all availabe options in this category
            if (valuesKeys.size === 0) {
                return options;
            }
            // Filter options
            return Object.fromEntries(Object.entries(options).filter(entry => {
                return valuesKeys.has(entry[0]);
            }));
        },
        [keys.length, activeTab, visibleTab],
    );

    // Handle selection change
    const handleChange = (key, value) => {
        board.updateElements(selection, [key], [value], true);
        props?.onChange?.();
    };

    return (
        <div className={props.className}>
            <div className="bg-white z-5 b-1 b-solid b-gray-300 w-60 r-xl shadow-md overflow-y-auto scrollbar" style={{maxHeight: props.maxHeight}}>
                <div className="pt-4 px-4 pb-2 bg-white position-sticky top-0">
                    <div className="w-full d-flex flex-no-wrap b-1 b-solid b-gray-300 r-md h-10">
                        <TabsItem
                            active={visibleTab === EDITION_TABS.FILL}
                            disabled={keys.length > 0 && typeof values[allOptions[EDITION_TABS.FILL].test] === "undefined"}
                            icon={(<ShapesIcon />)}
                            onClick={() => setActiveTab(EDITION_TABS.FILL)}
                        />
                        <TabsItem
                            active={visibleTab === EDITION_TABS.STROKE}
                            disabled={keys.length > 0 && typeof values[allOptions[EDITION_TABS.STROKE].test] === "undefined"}
                            icon={(<StrokeIcon />)}
                            onClick={() => setActiveTab(EDITION_TABS.STROKE)}
                        />
                        <TabsItem
                            active={visibleTab === EDITION_TABS.TEXT}
                            disabled={keys.length > 0 && typeof values[allOptions[EDITION_TABS.TEXT].test] === "undefined"}
                            icon={(<TextIcon />)}
                            onClick={() => setActiveTab(EDITION_TABS.TEXT)}
                        />
                    </div>
                </div>
                <div className="p-4">
                    <Form
                        key={visibleTab + selection.length}
                        data={values || {}}
                        items={visibleOptions}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

EditionPanel.defaultProps = {
    className: "position-absolute top-0 right-0 pt-4 pr-4",
    style: {},
    maxHeight: "calc(100vh - 6rem)",
    onChange: null,
};
