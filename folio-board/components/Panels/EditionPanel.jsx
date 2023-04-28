import React from "react";
import {DIALOGS} from "../../constants.js";
import {Panel, PanelSeparator, PanelTextButton} from "./Panel.jsx";
import {
    FillIcon,
    StrokeIcon,
    TextIcon,
    ShapesIcon,
    ArrowheadArrowIcon,
    TrashIcon,
    ObjectGroupIcon,
    ObjectUngroupIcon,
} from "../icons/index.jsx";
import {isDialogEnabledForSelection} from "../../utils.js";

const isGroupSelectionVisible = props => {
    // if (props.elements.length > 0 && !props.group) {
    // }
    const selectedGroups = new Set(props.elements.map(el => el.group));
    return !props.group && props.elements.length > 1 && (selectedGroups.size > 1 || selectedGroups.has(null));
};

const isUngroupSelectionVisible = props => {
    return !props.group && props.elements.length > 0 && props.elements.some(el => !!el.group);
};

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
        <PanelSeparator />
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
        <PanelTextButton text="Group" disabled={!isGroupSelectionVisible(props)} onClick={props.onGroupClick}>
            <ObjectGroupIcon />
        </PanelTextButton>
        <PanelTextButton text="Ungroup" disabled={!isUngroupSelectionVisible(props)} onClick={props.onUngroupClick}>
            <ObjectUngroupIcon />
        </PanelTextButton>
        {/* Remove current selection */}
        <PanelTextButton text="Remove" disabled={(props.elements || []).length === 0} onClick={props.onRemoveClick}>
            <TrashIcon />
        </PanelTextButton>
    </Panel>
);

EditionPanel.defaultProps = {
    className: "top-0 right-0 pt-4 pr-4",
    style: {},
    elements: [],
    group: null,
    dialog: null,
    onGroupClick: null,
    onUngroupClick: null,
    onRemoveClick: null,
    onDialogClick: null,
};
