import React from "react";
import classNames from "classnames";

import {ChevronDownIcon} from "@josemi-icons/react";
import {TrashIcon} from "@josemi-icons/react";

import {FORM_OPTIONS, FIELDS, THEMES} from "../constants.js";
import {COLORS} from "../constants.js";
import {TEXT_SIZES, FONT_FACES, TEXT_ALIGNS} from "../constants.js";
import {STROKES, STROKE_WIDTHS} from "../constants.js";
import {OPACITY_MIN, OPACITY_MAX, OPACITY_STEP} from "../constants.js";
import {SHAPES, FILL_STYLES} from "../constants.js";
import {ARROWHEADS} from "../constants.js";

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
    [SECTIONS.SHAPE]: {
        test: FIELDS.SHAPE,
        icon: (<ShapesIcon />),
        items: {
            [FIELDS.SHAPE]: {
                // title: "Shape",
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
    [SECTIONS.FILL]: {
        icon: (<FillIcon />),
        test: FIELDS.FILL_COLOR,
        items: {
            [FIELDS.FILL_STYLE]: {
                title: "Fill style",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: FILL_STYLES.NONE, icon: CircleSolidIcon()},
                    {value: FILL_STYLES.HATCH, icon: CircleHatchFillIcon()},
                    {value: FILL_STYLES.SOLID, icon: CircleSolidFillIcon()},
                ],
            },
            [FIELDS.FILL_COLOR]: {
                title: "Fill color",
                type: FORM_OPTIONS.COLOR,
                values: Object.values(COLORS),
            },
        },
    },
    [SECTIONS.STROKE]: {
        icon: (<StrokeIcon />),
        test: FIELDS.STROKE_COLOR,
        items: {
            strokeStyle: {
                title: "Stroke style",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: STROKES.DOTTED, icon: CircleDottedIcon()},
                    {value: STROKES.DASHED, icon: CircleDashedIcon()},
                    {value: STROKES.SOLID, icon: CircleSolidIcon()},
                ],
            },
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

const ButtonsWrapper = props => {
    const classList = classNames({
        "rounded-lg shadow-md flex items-center gap-1 relative p-1": true,
        "bg-gray-900 text-white": props.theme === THEMES.DARK,
        "bg-white text-gray-900 border border-gray-300": props.theme === THEMES.LIGHT,
    });
    return (
        <div className={classList}>
            {props.children}
        </div>
    );
};

const Button = props => {
    const classList = classNames(props.className, {
        "rounded-md flex justify-center items-center flex gap-0 p-3 cursor-pointer": true,
        "px-2": props.showChevron,
        "text-white hover:bg-gray-800": props.theme === THEMES.DARK && !props.active,
        "text-white bg-gray-800": props.theme === THEMES.DARK && props.active,
        "text-gray-900 hover:bg-gray-100": props.theme === THEMES.LIGHT && !props.active,
        "text-gray-900 bg-gray-200": props.theme === THEMES.LIGHT && props.active,
    });
    return (
        <div className={classList} style={props.style} onClick={props.onClick}>
            <div className="text-lg flex items-center">
                {props.icon}
            </div>
            {props.showChevron && (
                <div className="text-xs flex items-center">
                    <ChevronDownIcon />
                </div>
            )}
        </div>
    );
};

Button.defaultProps = {
    className: "",
    style: null,
    icon: null,
    active: false,
    theme: THEMES.LIGHT,
    showChevron: false,
    onClick: null,
};

// Active section wrapper
const ActiveSectionWrapper = props => {
    const classList = classNames({
        "absolute left-half p-3 rounded-lg w-56 shadow-md": true,
        "top-full mt-2": !props.alignToTop,
        "bottom-full mb-2": props.alignToTop,
        "bg-white border border-gray-300": props.theme === THEMES.LIGHT,
        "bg-gray-900": props.theme === THEMES.DARK,
    });
    return (
        <div className={classList} style={{transform: "translateX(-50%)"}}>
            <Form
                className="flex flex-col gap-2"
                theme={props.theme}
                data={props.values}
                items={props.items}
                onChange={props.onChange}
            />
        </div>
    );
};

// Separator for buttons
const Separator = props => {
    const classList = classNames({
        "w-px h-10": true,
        "bg-gray-200": props.theme === THEMES.LIGHT,
        "bg-white o-20": props.theme === THEMES.DARK,
    });
    return (
        <div className={classList} />
    );
};

export const EditionPanel = props => {
    const [activeSection, setActiveSection] = React.useState("");
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
    const values = useValues(selectedElements);
    const keys = Object.keys(values);
    const bounds = getRectangleBounds(selectedElements);
    // Get visible sections
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
    // Handle selection change
    const handleChange = (key, value) => {
        board.updateElements(selectedElements, [key], [value], true);
        board.update();
        props?.onChange?.({
            elements: board.elements,
        });
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
            <ButtonsWrapper theme={props.theme}>
                {visibleSections.map(key => (
                    <div className="relative" key={key}>
                        <Button
                            theme={props.theme}
                            active={activeSection === key}
                            icon={allSections[key].icon}
                            showChevron={true}
                            onClick={() => handleSectionChange(key)}
                        />
                        {activeSection === key && (
                            <ActiveSectionWrapper
                                key={activeSection}
                                theme={props.theme}
                                alignToTop={style.top > board.state.canvasHeight / 2}
                                values={values || {}}
                                items={allSections[activeSection].items}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                ))}
                <Separator theme={props.theme} />
                <Button
                    icon={(<TrashIcon />)}
                    onClick={() => {
                        board.remove();
                        props?.onChange?.(board.export());
                        board.update();
                    }}
                />
            </ButtonsWrapper>
        </div>
    );
};

EditionPanel.defaultProps = {
    theme: THEMES.LIGHT,
    offset: 24,
    onChange: null,
};
