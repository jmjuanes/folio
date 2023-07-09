import React from "react";
import classNames from "classnames";


import {COLORS, FIELDS} from "../constants.js";
import {TEXT_SIZES, FONT_FACES, TEXT_ALIGNS} from "../constants.js";
import {STROKES, STROKE_WIDTHS} from "../constants.js";
import {OPACITY_MIN, OPACITY_MAX, OPACITY_STEP} from "../constants.js";
import {SHAPES, FILL_STYLES} from "../constants.js";
import {ARROWHEADS} from "../constants.js";
import {FORM_OPTIONS} from "../constants.js";

import {Form} from "./Form.jsx";

import {FillIcon, StrokeIcon, TextIcon, ShapesIcon, SunIcon} from "./Icons.jsx";
import {CircleSolidIcon, CircleDashedIcon, CircleDottedIcon} from "./Icons.jsx";
import {CircleSolidFillIcon, CircleHatchFillIcon} from "./Icons.jsx";
import {SquareIcon, CircleIcon, TriangleIcon, DiamondIcon} from "./Icons.jsx";
import {ArrowheadNoneIcon, ArrowheadArrowIcon, ArrowheadTriangleIcon, ArrowheadSquareIcon, ArrowheadCircleIcon} from "./Icons.jsx";
import {TextCenterIcon, TextLeftIcon, TextRightIcon, TextJustifyIcon} from "./Icons.jsx";

import {useBoard} from "../contexts/BoardContext.jsx";
import {getRectangleBounds} from "../utils/math.js";

// Available sections
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

const allSections = {
    [SECTIONS.FILL]: {
        icon: (<FillIcon />),
        test: FIELDS.FILL_COLOR,
        items: {
            [FIELDS.FILL_COLOR]: {
                title: "Fill color",
                type: FORM_OPTIONS.COLOR,
                values: Object.values(COLORS),
            },
            [FIELDS.FILL_STYLE]: {
                title: "Fill style",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: FILL_STYLES.NONE, icon: CircleSolidIcon()},
                    {value: FILL_STYLES.HATCH, icon: CircleHatchFillIcon()},
                    {value: FILL_STYLES.SOLID, icon: CircleSolidFillIcon()},
                ],
            },
        },
    },
    [SECTIONS.STROKE]: {
        icon: (<StrokeIcon />),
        test: FIELDS.STROKE_COLOR,
        items: {
            strokeColor: {
                title: "Stroke color",
                type: FORM_OPTIONS.COLOR,
                values: Object.values(COLORS),
            },
            strokeWidth: {
                title: "Stroke width",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: STROKE_WIDTHS.SMALL, text: "S"},
                    {value: STROKE_WIDTHS.MEDIUM, text: "M"},
                    {value: STROKE_WIDTHS.LARGE, text: "L"},
                    {value: STROKE_WIDTHS.XLARGE, text: "XL"},
                ],
            },
            strokeStyle: {
                title: "Stroke style",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: STROKES.DOTTED, icon: CircleDottedIcon()},
                    {value: STROKES.DASHED, icon: CircleDashedIcon()},
                    {value: STROKES.SOLID, icon: CircleSolidIcon()},
                ],
            },
        },
    },
    [SECTIONS.TEXT]: {
        icon: (<TextIcon />),
        test: FIELDS.TEXT_COLOR,
        items: {
            textColor: {
                title: "Text color",
                type: FORM_OPTIONS.COLOR,
                values: Object.values(COLORS),
            },
            textFont: {
                title: "Text font",
                type: FORM_OPTIONS.FONT,
                values: Object.values(FONT_FACES),
            },
            textSize: {
                title: "Text size",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: TEXT_SIZES.XSMALL, text: "XS"},
                    {value: TEXT_SIZES.SMALL, text: "S"},
                    {value: TEXT_SIZES.MEDIUM, text: "M"},
                    {value: TEXT_SIZES.LARGE, text: "L"},
                    {value: TEXT_SIZES.XLARGE, text: "XL"},
                ],
            },
            textAlign: {
                title: "Text align",
                type: FORM_OPTIONS.SELECT,
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
        test: FIELDS.START_ARROWHEAD,
        icon: (<ArrowheadArrowIcon />),
        items: {
            [FIELDS.START_ARROWHEAD]: {
                title: "Start arrowhead",
                type: FORM_OPTIONS.SELECT,
                values: arrowheadValues,
            },
            [FIELDS.END_ARROWHEAD]: {
                title: "End arrowhead",
                type: FORM_OPTIONS.SELECT,
                values: arrowheadValues,
            },
        },
    },
    [SECTIONS.SHAPE]: {
        test: FIELDS.SHAPE,
        icon: (<ShapesIcon />),
        items: {
            [FIELDS.SHAPE]: {
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: SHAPES.RECTANGLE, icon: SquareIcon()},
                    {value: SHAPES.ELLIPSE, icon: CircleIcon()},
                    {value: SHAPES.DIAMOND, icon: DiamondIcon()},
                    {value: SHAPES.TRIANGLE, icon: TriangleIcon()},
                ],
            },
        },
    },
    [SECTIONS.EFFECTS]: {
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
        },
    },
};

const useValues = selection => {
    // Check if we have only one selected item
    if (selection.length === 1) {
        return selection[0];
    }
    // Compute common values from selection
    return selection.reduce((prev, item) => ({...prev, ...item}), {});
};

const Button = props => {
    const classList = classNames(props.className, {
        "rounded-md flex justify-center items-center flex p-3": true,
        "hover:bg-gray-800 cursor-pointer": !props.active,
        "bg-gray-800 cursor-pointer": props.active,
    });
    return (
        <div className={classList} style={props.style} onClick={props.onClick}>
            <div className="text-lg text-white flex items-center">
                {props.icon}
            </div>
        </div>
    );
};

Button.defaultProps = {
    className: "",
    style: null,
    icon: null,
    active: false,
    onClick: null,
};

// Active section wrapper
const ActiveSectionWrapper = props => {
    const classList = classNames({
        "absolute": true,
        "top-full mt-1": props.position === "bottom",
        "top-0 mb-1": props.position === "top",
    });
    const style = {
        "transform": props.position === "top" ? "translateY(-100%)" : "",
    };
    return (
        <div className={classList} style={style}>
            <div className="p-3 bg-white rounded-md w-48 shadow-md border border-gray-300">
                {props.children}
            </div>
        </div>
    );
};

export const NewEditionPanel = props => {
    const [activeSection, setActiveSection] = React.useState("");
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
    const values = useValues(selectedElements);
    const keys = Object.keys(values);
    const bounds = getRectangleBounds(selectedElements);
    // Calculate position of the edition panel
    const x = board.translateX + (board.zoom * (bounds.x1 + bounds.x2) / 2)
    const y = board.translateY + (board.zoom * (bounds.y1 + bounds.y2) / 2);
    const width = board.zoom * Math.abs(bounds.x2 - bounds.x1);
    const height = board.zoom * Math.abs(bounds.y2 - bounds.y1);
    // Check if element is outside the view zone
    // TODO: enable this when wheel actions are enabled
    // if (x + width / 2 < 0 || x - width / 2 > board.state.canvasWidth) {
    //     return null;
    // }
    // if (y + height / 2 < 0 || y - height / 2 > board.state.canvasHeight) {
    //     return null;
    // }
    // Initialize position of the edition panel
    const style = {
        top: y - props.offset - height / 2,
        left: x,
        transform: "translateX(-50%) translateY(-100%)",
    };
    const sectionPosition = style.top > board.state.canvasHeight / 2 ? "top" : "bottom";
    const visibleSections = React.useMemo(
        () => {
            // If no keys are available, we will display all availabe options in this category
            if (keys.length === 0) {
                return Object.keys(allSections);
            }
            // Filter options
            return Object.keys(allSections).filter(option => {
                return typeof values[allSections[option].test] !== "undefined";
            });
        },
        [keys.length],
    );
    // Handle selection change
    const handleChange = (key, value) => {
        board.updateElements(selectedElements, [key], [value], true);
        props?.onChange?.();
    };
    // Handle active section change
    const handleSectionChange = newSection => {
        return setActiveSection(prevSection => {
            return prevSection === newSection ? "" : newSection;
        });
    };
    // Render new edition panel
    return (
        <div className="absolute z-4" style={style}>
            <div className="bg-gray-900 text-white rounded-md shadow-md flex items-center relative">
                {visibleSections.map(key => (
                    <Button
                        key={key}
                        active={activeSection === key}
                        icon={allSections[key].icon}
                        onClick={() => handleSectionChange(key)}
                    />
                ))}
                {activeSection && (
                    <ActiveSectionWrapper position={sectionPosition}>
                        <Form
                            className="flex flex-col gap-2"
                            key={activeSection}
                            data={values || {}}
                            items={allSections[activeSection].items}
                            onChange={handleChange}
                        />
                    </ActiveSectionWrapper>
                )}
            </div>
        </div>
    );
};

NewEditionPanel.defaultProps = {
    offset: 16,
    margin: 64,
};
