import React from "react";
import {
    BanIcon,
    BringForwardIcon,
    BringFrontIcon,
    CircleIcon,
    CopyIcon,
    DiamondIcon,
    FillIcon,
    LockIcon,
    NoteIcon,
    SendBackIcon,
    SendBackwardIcon,
    SquareIcon,
    TextIcon,
    TextCenterIcon,
    TextLeftIcon,
    TextRightIcon,
    TextJustifyIcon,
    TrashIcon,
    TriangleIcon,
    UnlockIcon,
} from "@josemi-icons/react";
import {
    FIELDS,
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
    ARROW_SHAPES,
    FORM_OPTIONS,
} from "../../constants.js";
import {
    FILL_COLOR_PALETTE,
    STROKE_COLOR_PALETTE,
    TEXT_COLOR_PALETTE,
    NOTE_COLOR_PALETTE,
} from "../../utils/colors.js";
import {
    ArrowIcon,
    ArrowConnectorIcon,
    StrokeIcon,
    CircleSolidIcon,
    CircleDashedIcon,
    CircleDottedIcon,
    CircleSolidFillIcon,
    CircleHatchFillIcon,
    CircleSemiFillIcon,
    ArrowheadNoneIcon,
    ArrowheadArrowIcon,
    ArrowheadTriangleIcon,
    ArrowheadSquareIcon,
    ArrowheadCircleIcon,
} from "../icons.jsx";
import {Panel} from "../ui/panel.jsx";
import {Form} from "../form/index.jsx";
import {useScene} from "../../contexts/scene.jsx";

// Available sections
const SECTIONS = {
    NOTE: "note",
    FILL: "fill",
    STROKE: "stroke",
    TEXT: "text",
    EFFECTS: "effects",
    ARROWS: "arrows",
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
    [SECTIONS.ARROWS]: {
        test: FIELDS.START_ARROWHEAD,
        items: {
            [FIELDS.ARROW_SHAPE]: {
                title: "Arrow shape",
                type: FORM_OPTIONS.SELECT,
                values: [
                    {value: ARROW_SHAPES.LINE, icon: ArrowIcon()},
                    {value: ARROW_SHAPES.CONNECTOR, icon: ArrowConnectorIcon()},
                ],
            },
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

const getVisibleSections = (sections, values) => {
    return Object.keys(sections).filter(option => {
        return typeof values[sections[option].test] !== "undefined";
    });
};

export const EditionPanel = props => {
    const scene = useScene();
    const selectedElements = scene.getSelection();
    const [activeSection, setActiveSection] = React.useState("");
    const values = useValues(selectedElements);
    const keys = Object.keys(values);

    // Get visible sections
    const visibleSections = React.useMemo(() => {
        return {
            style: getVisibleSections(styleSections, values),
            display: getVisibleSections(displaySections, values),
        };
    }, [keys.length]);

    // Handle selection change
    const handleChange = React.useCallback((key, value) => {
        if (key === "actions" || key === "layers") {
            switch (value) {
                case ACTIONS.REMOVE:
                    scene.removeElements(selectedElements);
                    break;
                case ACTIONS.DUPLICATE:
                    scene.duplicateElements(selectedElements);
                    break;
                case ACTIONS.SEND_BACK:
                    scene.sendElementsToBack(selectedElements);
                    break;
                case ACTIONS.SEND_BACKWARD:
                    scene.sendElementsBackward(selectedElements);
                    break;
                case ACTIONS.BRING_FORWARD:
                    scene.bringElementsForward(selectedElements);
                    break;
                case ACTIONS.BRING_FRONT:
                    scene.bringElementsToFront(selectedElements);
                    break;
                case ACTIONS.LOCK:
                    scene.lockElements(selectedElements);
                    break;
                case ACTIONS.UNLOCK:
                    scene.unlockElements(selectedElements);
                    break;
            }
        }
        else {
            scene.updateElements(selectedElements, [key], [value], true);
        }
        props.onChange();
    }, [selectedElements.length, props.onChange]);

    // Handle active section change
    const handleSectionChange = newSection => {
        return setActiveSection(prevSection => {
            return prevSection === newSection ? "" : newSection;
        });
    };
    // Fix value of active section
    const currentSection = activeSection || visibleSections.style[0];
    return (
        <Panel className="w-56">
            <Panel.Body className="flex flex-col gap-2">
                {visibleSections.style.length > 0 && (
                    <React.Fragment>
                        {visibleSections.style.length > 1 && (
                            <Panel.Tabs>
                                {visibleSections.style.map(key => (
                                    <Panel.TabsItem
                                        key={key}
                                        active={currentSection === key}
                                        onClick={() => handleSectionChange(key)}>
                                        {styleSections[key].icon}
                                    </Panel.TabsItem>
                                ))}
                            </Panel.Tabs>
                        )}
                        <Form
                            key={currentSection}
                            className="flex flex-col gap-2"
                            data={values}
                            items={styleSections[currentSection].items}
                            onChange={handleChange}
                        />
                    </React.Fragment>
                )}
                {visibleSections.display.map((key, index) => (
                    <React.Fragment key={key}>
                        {(index > 0 || visibleSections.style.length > 0) && (
                            <Panel.Separator />
                        )}
                        <Form
                            key={key}
                            className="flex flex-col gap-2"
                            data={values}
                            items={displaySections[key].items}
                            onChange={handleChange}
                        />
                    </React.Fragment>
                ))}
            </Panel.Body>
        </Panel>
    );
};
