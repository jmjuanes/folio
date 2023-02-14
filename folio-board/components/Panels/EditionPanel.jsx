import React from "react";
import {DIALOGS} from "../../constants.js";
import {Panel, PanelTextButton} from "./Panel.jsx";
import {
    FillIcon,
    StrokeIcon,
    TextIcon,
    ShapesIcon,
    ArrowheadArrowIcon,
    TrashIcon,
} from "../icons/index.jsx";

// const isGroupSelectionVisible = selection => {
//     const selectedGroups = new Set(selection.map(el => el.group));
//     return selection.length > 1 && (selectedGroups.size > 1 || selectedGroups.has(null));
// };

// const isUngroupSelectionVisible = selection => {
//     return selection.length > 0 && selection.some(el => !!el.group);
// };

const getButtonProps = (props, type, test) => {
    const elements = props.elements || [];
    let isDisabled = true;
    if (elements.length === 0 || (elements.length === 1 && typeof elements[0]?.[test] !== "undefined")) {
        isDisabled = false;
    }
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
        {/* Style buttons */}
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
        {/* Order buttons */}
        {/*
        <{false && (
            <React.Fragment>
                <Button
                    icon="bring-forward"
                    onClick={props.onBringForwardClick}
                />
                <Button
                    icon="send-backward"
                    onClick={props.onSendBackwardClick}
                />
            </React.Fragment>
        )}
        */}
        {/* Group handlers */}
        {/*
        <PanelButton disabled={hasActiveGroup || !isGroupSelectionVisible(props.selection)} onClick={props.onGroupSelectionClick}>
            <ObjectGroupIcon />
        </PanelButton>
        <PanelButton disabled={hasActiveGroup || !isUngroupSelectionVisible(props.selection)} onClick={props.onUngroupSelectionClick}>
            <ObjectUngroupIcon />
        </PanelButton>
        */}
        {/* Remove current selection */}
        <PanelTextButton text="Remove" disabled={(props.elements || []).length === 0} onClick={props.onRemoveClick}>
            <TrashIcon />
        </PanelTextButton>
    </Panel>
);

EditionPanel.defaultProps = {
    className: "top:0 right:0 pt:4 pr:4",
    style: {},
    elements: [],
    dialog: null,
    // activeGroup: null,
    // onGroupSelectionClick: null,
    // onUngroupSelectionClick: null,
    onRemoveClick: null,
    onDialogClick: null,
};
