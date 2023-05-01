import React from "react";
import {DIALOGS} from "../../constants.js";
import {Panel, PanelTextButton} from "./Panel.jsx";
import {
    FillIcon,
    StrokeIcon,
    TextIcon,
    ShapesIcon,
    ArrowheadArrowIcon,
} from "../icons/index.jsx";
import {isDialogEnabledForSelection} from "../../board.js";

const getButtonProps = (props, type, test) => {
    const elements = props.elements || [];
    let isDisabled = !isDialogEnabledForSelection(type, elements);
    // if (elements.length === 0 || (elements.length === 1 && typeof elements[0]?.[test] !== "undefined")) {
    //     isDisabled = false;
    // }
    return {
        active: props.dialog === type,
        disabled: isDisabled,
        onClick: () => {
            if (!isDisabled) {
                return props.onDialogClick?.(type === props.dialog ? null : type);
            }
        },
    };
};

export const EditionPanel = props => (
    <Panel direction="col" className={props.className} style={props.style}>
        <PanelTextButton text="Fill" {...getButtonProps(props, DIALOGS.FILL, "fillColor")}>
            <FillIcon />
        </PanelTextButton>
        <PanelTextButton text="Stroke" {...getButtonProps(props, DIALOGS.STROKE, "strokeColor")}>
            <StrokeIcon />
        </PanelTextButton>
        <PanelTextButton text="Text" {...getButtonProps(props, DIALOGS.TEXT, "textColor")}>
            <TextIcon />
        </PanelTextButton>
        <PanelTextButton text="Arrow" {...getButtonProps(props, DIALOGS.ARROWHEAD, "startArrowhead")}>
            <ArrowheadArrowIcon />
        </PanelTextButton>
        <PanelTextButton text="Shape" {...getButtonProps(props, DIALOGS.SHAPE, "shape")}>
            <ShapesIcon />
        </PanelTextButton>
    </Panel>
);

EditionPanel.defaultProps = {
    className: "top-0 right-0 pt-4 pr-4",
    style: {},
    elements: [],
    dialog: null,
    onDialogClick: null,
};
