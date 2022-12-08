import React from "react";

import {Panel, PanelButton} from "./Panel.jsx";
import {
    FillIcon,
    StrokeIcon,
    TextIcon,
    EditIcon,
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
                return props.onDialogClick?.(id === props.dialog ? null : id);
            }
        },
    };
};

export const EditionPanel = props => (
    <Panel position="top-right">
        {/* Style buttons */}
        <PanelButton {...getButtonProps(props, "fill", "fillColor")}>
            <FillIcon />
        </PanelButton>
        <PanelButton {...getButtonProps(props, "stroke", "strokeColor")}>
            <StrokeIcon />
        </PanelButton>
        <PanelButton {...getButtonProps(props, "text", "textColor")}>
            <TextIcon />
        </PanelButton>
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
        <PanelButton disabled={(props.elements || []).length === 0} onClick={props.onRemoveClick}>
            <TrashIcon />
        </PanelButton>
    </Panel>
);

EditionPanel.defaultProps = {
    elements: [],
    dialog: null,
    // activeGroup: null,
    // onGroupSelectionClick: null,
    // onUngroupSelectionClick: null,
    onRemoveClick: null,
    onDialogClick: null,
};
