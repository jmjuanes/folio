import React from "react";

import {Panel, PanelButton} from "./Panel.jsx";
import {
    EditIcon,
    ObjectGroupIcon,
    ObjectUngroupIcon,
    TrashIcon,
} from "../Icons.jsx";

// const isGroupSelectionVisible = selection => {
//     const selectedGroups = new Set(selection.map(el => el.group));
//     return selection.length > 1 && (selectedGroups.size > 1 || selectedGroups.has(null));
// };

// const isUngroupSelectionVisible = selection => {
//     return selection.length > 0 && selection.some(el => !!el.group);
// };

export const EditionPanel = props => (
    <Panel position="top-right">
        {/* Style button */}
        <PanelButton active={!!props.styleDialogActive} onClick={props.onStyleDialogToggle}>
            <EditIcon />
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
        <PanelButton disabled={!props.selection || props.selection.length === 0} onClick={props.onRemoveClick}>
            <TrashIcon />
        </PanelButton>
    </Panel>
);

EditionPanel.defaultProps = {
    selection: [],
    // activeGroup: null,
    styleDialogActive: false,
    // onGroupSelectionClick: null,
    // onUngroupSelectionClick: null,
    onRemoveClick: null,
    onStyleDialogToggle: null,
};
