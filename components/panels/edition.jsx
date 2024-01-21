import React from "react";
import classNames from "classnames";
import {TrashIcon, BanIcon, CopyIcon, LockIcon, UnlockIcon} from "@josemi-icons/react";
import {NoteIcon} from "@josemi-icons/react";
import {
    FORM_OPTIONS,
    FIELDS,
    THEMES,
    TEXT_SIZES,
    FONT_FACES,
    TEXT_ALIGNS,
    STROKES,
    STROKE_WIDTHS,
    OPACITY_MIN,
    OPACITY_MAX,
    OPACITY_STEP,
    SHAPES,
    FILL_STYLES,
    ARROWHEADS,
} from "@lib/constants.js";
import {
    FILL_COLOR_PALETTE,
    STROKE_COLOR_PALETTE,
    TEXT_COLOR_PALETTE,
    NOTE_COLOR_PALETTE,
} from "@lib/utils/colors.js";
import {
    FillIcon,
    StrokeIcon,
    TextIcon,
    CircleSolidIcon,
    CircleDashedIcon,
    CircleDottedIcon,
    CircleSolidFillIcon,
    CircleHatchFillIcon,
    CircleSemiFillIcon,
    SquareIcon,
    CircleIcon,
    TriangleIcon,
    DiamondIcon,
    ArrowheadNoneIcon,
    ArrowheadArrowIcon,
    ArrowheadTriangleIcon,
    ArrowheadSquareIcon,
    ArrowheadCircleIcon,
    TextCenterIcon,
    TextLeftIcon,
    TextRightIcon,
    TextJustifyIcon,
    BringForwardIcon,
    BringFrontIcon,
    SendBackIcon,
    SendBackwardIcon,
} from "@components/icons.jsx";
import {Form} from "@components/commons/form.jsx";
import {useBoard} from "@components/contexts/board.jsx";

// Available sections
const SECTIONS = {
    NOTE: "note",
    FILL: "fill",
    STROKE: "stroke",
    TEXT: "text",
    EFFECTS: "effects",
    ARROWHEADS: "arrowheads",
    SHAPE: "shape",
    ACTIONS: "actions",
};

// Available actions
const ACTIONS = {
    REMOVE: "action:remove",
    DUPLICATE: "action:duplicate",
    LOCK: "action:lock",
    UNLOCK: "action:unlock",
    BRING_FRONT: "layer:bringFront",
    BRING_FORWARD: "layer:bringForward",
    SEND_BACK: "layer:sendBack",
    SEND_BACKWARD: "layer:sendBackward",
};

const arrowheadValues = [
    {value: ARROWHEADS.NONE, icon: ArrowheadNoneIcon()},
    {value: ARROWHEADS.ARROW, icon: ArrowheadArrowIcon()},
    {value: ARROWHEADS.TRIANGLE, icon: ArrowheadTriangleIcon()},
    {value: ARROWHEADS.SQUARE, icon: ArrowheadSquareIcon()},
    {value: ARROWHEADS.CIRCLE, icon: ArrowheadCircleIcon()},
    // {value: ARROWHEADS.SEGMENT, icon: ArrowheadSegmentIcon()},
];

// Style sections
const styleSections = {
    [SECTIONS.NOTE]: {
        test: FIELDS.NOTE_COLOR,
        icon: (<NoteIcon />),
        items: {
            [FIELDS.NOTE_COLOR]: {
                title: "Note color",
                type: FORM_OPTIONS.COLOR,
                values: NOTE_COLOR_PALETTE,
                showInput: false,
            },
        },
    },
    [SECTIONS.FILL]: {
        icon: (<FillIcon />),
        test: FIELDS.FILL_COLOR,
        showChevron: true,
        items: {
            [FIELDS.FILL_STYLE]: {
                title: "Fill style",
                type: FORM_OPTIONS.LABELED_SELECT,
                values: [
                    {value: FILL_STYLES.NONE, icon: BanIcon()},
                    {value: FILL_STYLES.HATCH, icon: CircleHatchFillIcon(), label: "Hatch"},
                    {value: FILL_STYLES.TRANSPARENT, icon: CircleSemiFillIcon(), label: "Semi"},
                    {value: FILL_STYLES.SOLID, icon: CircleSolidFillIcon(), label: "Solid"},
                ],
            },
            [FIELDS.FILL_COLOR]: {
                title: "Fill color",
                type: FORM_OPTIONS.COLOR,
                values: FILL_COLOR_PALETTE,
            },
        },
    },
    [SECTIONS.STROKE]: {
        icon: (<StrokeIcon />),
        test: FIELDS.STROKE_COLOR,
        showChevron: true,
        items: {
            strokeStyle: {
                title: "Stroke style",
                type: FORM_OPTIONS.LABELED_SELECT,
                isVisible: (value, currentValue, data) => {
                    return value !== STROKES.NONE || typeof data[FIELDS.FILL_STYLE] !== "undefined";
                },
                values: [
                    {value: STROKES.NONE, icon: BanIcon()},
                    {value: STROKES.DOTTED, icon: CircleDottedIcon(), label: "Dots"},
                    {value: STROKES.DASHED, icon: CircleDashedIcon(), label: "Dash"},
                    {value: STROKES.SOLID, icon: CircleSolidIcon(), label: "Solid"},
                ],
            },
            strokeColor: {
                title: "Stroke color",
                type: FORM_OPTIONS.COLOR,
                values: STROKE_COLOR_PALETTE,
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
        test: FIELDS.TEXT,
        showChevron: true,
        items: {
            [FIELDS.TEXT_COLOR]: {
                title: "Text color",
                type: FORM_OPTIONS.COLOR,
                values: TEXT_COLOR_PALETTE,
                test: data => typeof data[FIELDS.TEXT_COLOR] !== "undefined",
            },
            [FIELDS.TEXT_FONT]: {
                title: "Font family",
                type: FORM_OPTIONS.FONT,
                values: Object.values(FONT_FACES),
            },
            [FIELDS.TEXT_SIZE]: {
                title: "Font size",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: TEXT_SIZES.XSMALL, text: "XS"},
                    {value: TEXT_SIZES.SMALL, text: "S"},
                    {value: TEXT_SIZES.MEDIUM, text: "M"},
                    {value: TEXT_SIZES.LARGE, text: "L"},
                    {value: TEXT_SIZES.XLARGE, text: "XL"},
                ],
            },
            [FIELDS.TEXT_ALIGN]: {
                title: "Text align",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: TEXT_ALIGNS.LEFT, icon: TextLeftIcon()},
                    {value: TEXT_ALIGNS.CENTER, icon: TextCenterIcon()},
                    {value: TEXT_ALIGNS.RIGHT, icon: TextRightIcon()},
                    {value: TEXT_ALIGNS.JUSTIFY, icon: TextJustifyIcon()},
                ],
                test: data => typeof data[FIELDS.TEXT_ALIGN] !== "undefined",
            },
        },
    },
};

// Display sections
const displaySections = {
    [SECTIONS.SHAPE]: {
        test: FIELDS.SHAPE,
        items: {
            [FIELDS.SHAPE]: {
                title: "Shape",
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
    [SECTIONS.ARROWHEADS]: {
        test: FIELDS.START_ARROWHEAD,
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
    [SECTIONS.ACTIONS]: {
        test: FIELDS.ORDER,
        items: {
            layers: {
                type: FORM_OPTIONS.SELECT,
                title: "Layers",
                className: "grid grid-cols-4 gap-1 w-full",
                values: [
                    {value: ACTIONS.SEND_BACK, icon: SendBackIcon()},
                    {value: ACTIONS.SEND_BACKWARD, icon: SendBackwardIcon()},
                    {value: ACTIONS.BRING_FORWARD, icon: BringForwardIcon()},
                    {value: ACTIONS.BRING_FRONT, icon: BringFrontIcon()},
                ],
            },
            actions: {
                type: FORM_OPTIONS.SELECT,
                title: "Actions",
                className: "grid grid-cols-4 gap-1 w-full",
                isVisible: (field, value, data) => {
                    if (field === ACTIONS.LOCK) {
                        return !data[FIELDS.LOCKED];
                    }
                    else if (field === ACTIONS.UNLOCK) {
                        return !!data[FIELDS.LOCKED];
                    }
                    // Field is visible
                    return true;
                },
                isActive: (field, value, data) => {
                    return field === ACTIONS.UNLOCK;
                },
                values: [
                    {value: ACTIONS.LOCK, icon: UnlockIcon()},
                    {value: ACTIONS.UNLOCK, icon: LockIcon()},
                    {value: ACTIONS.DUPLICATE, icon: CopyIcon()},
                    {value: ACTIONS.REMOVE, icon: TrashIcon()},
                ],
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

const TabsWrapper = props => (
    <div className="flex gap-1 items-center flex-nowrap rounded-lg bg-neutral-100 p-1">
        {props.children}
    </div>
);

const TabButton = props => {
    const classList = classNames(props.className, {
        "rounded-md flex justify-center items-center flex gap-0 p-2 cursor-pointer w-full": true,
        // "text-white hover:bg-gray-800": props.theme === THEMES.DARK && !props.active,
        // "text-white bg-gray-800": props.theme === THEMES.DARK && props.active,
        "text-neutral-800 hover:bg-neutral-200": props.theme === THEMES.LIGHT && !props.active,
        "text-white bg-neutral-900": props.theme === THEMES.LIGHT && props.active,
    });
    return (
        <div className={classList} style={props.style} onClick={props.onClick}>
            <div className="flex items-center">
                {props.icon}
            </div>
        </div>
    );
};

TabButton.defaultProps = {
    className: "",
    style: null,
    icon: null,
    active: false,
    theme: THEMES.LIGHT,
    onClick: null,
};

// Active section wrapper
const ActiveSectionWrapper = props => (
    <Form
        className="flex flex-col gap-2"
        theme={props.theme}
        data={props.values}
        items={props.items}
        onChange={props.onChange}
    />
);

// Separator for buttons
const Separator = props => {
    const classList = classNames({
        "w-full h-px": true,
        "bg-neutral-200": props.theme === THEMES.LIGHT,
        "bg-white o-20": props.theme === THEMES.DARK,
    });
    return (
        <div className={classList} />
    );
};

const EditionWrapper = props => (
    <div className="w-56 border border-neutral-200 rounded-xl shadow-md bg-white p-2">
        <div className="flex flex-col gap-2">
            {props.children}
        </div>
    </div>
);

const getVisibleSections = (sections, values) => {
    return Object.keys(sections).filter(option => {
        return typeof values[sections[option].test] !== "undefined";
    });
};

export const EditionPanel = props => {
    const [activeSection, setActiveSection] = React.useState("");
    const board = useBoard();
    const selectedElements = board.getSelectedElements();
    const values = useValues(selectedElements);
    const keys = Object.keys(values);
    // Get visible sections
    const visibleSections = React.useMemo(
        () => {
            return {
                style: getVisibleSections(styleSections, values),
                display: getVisibleSections(displaySections, values),
            };
        },
        [keys.length],
    );
    // Handle selection change
    const handleChange = (key, value) => {
        if (key === "actions" || key === "layers") {
            switch (value) {
                case ACTIONS.REMOVE:
                    board.remove();
                    break;
                case ACTIONS.DUPLICATE:
                    board.duplicate();
                    break;
                case ACTIONS.SEND_BACK:
                    board.sendSelectedElementsToBack();
                    break;
                case ACTIONS.SEND_BACKWARD:
                    board.sendSelectedElementsBackward();
                    break;
                case ACTIONS.BRING_FORWARD:
                    board.bringSelectedElementsForward();
                    break;
                case ACTIONS.BRING_FRONT:
                    board.bringSelectedElementsToFront();
                    break;
                case ACTIONS.LOCK:
                    board.lockElements(selectedElements);
                    break;
                case ACTIONS.UNLOCK:
                    board.unlockElements(selectedElements);
                    break;
            }
            // Handle change
            props?.onChange?.(board.export());
        }
        else {
            board.updateElements(selectedElements, [key], [value], true);
            props?.onChange?.({
                elements: board.elements,
            });
        }
        // Force an update
        board.update();
    };
    // Handle active section change
    const handleSectionChange = newSection => {
        return setActiveSection(prevSection => {
            return prevSection === newSection ? "" : newSection;
        });
    };
    // Fix value of active section
    const currentSection = activeSection || visibleSections.style[0];
    return (
        <EditionWrapper>
            {visibleSections.style.length > 0 && (
                <React.Fragment>
                    {visibleSections.style.length > 1 && (
                        <TabsWrapper>
                            {visibleSections.style.map(key => (
                                <TabButton
                                    key={key}
                                    theme={props.theme}
                                    active={currentSection === key}
                                    icon={styleSections[key].icon}
                                    onClick={() => handleSectionChange(key)}
                                />
                            ))}
                        </TabsWrapper>
                    )}
                    <ActiveSectionWrapper
                        key={currentSection}
                        theme={props.theme}
                        values={values || {}}
                        items={styleSections[currentSection].items}
                        onChange={handleChange}
                    />
                </React.Fragment>
            )}
            {visibleSections.display.map((key, index) => (
                <React.Fragment key={key}>
                    {(index > 0 || visibleSections.style.length > 0) && (
                        <Separator theme={props.theme} />
                    )}
                    <ActiveSectionWrapper
                        key={key}
                        theme={props.theme}
                        values={values || {}}
                        items={displaySections[key].items}
                        onChange={handleChange}
                    />
                </React.Fragment>
            ))}
        </EditionWrapper>
    );
};

EditionPanel.defaultProps = {
    theme: THEMES.LIGHT,
    offset: 24,
    onChange: null,
};
