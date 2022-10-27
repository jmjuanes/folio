import React from "react";

import {Panel, PanelButton} from "./index.jsx";
import {
    EditIcon,
    ObjectGroupIcon,
    ObjectUngroupIcon,
    TrashIcon,
} from "../Icons.jsx";

const isGroupSelectionVisible = selection => {
    const selectedGroups = new Set(selection.map(el => el.group));
    return selection.length > 1 && (selectedGroups.size > 1 || selectedGroups.has(null));
};

const isUngroupSelectionVisible = selection => {
    return selection.length > 0 && selection.some(el => !!el.group);
};

export const EditionPanel = props => {
    const [styleVisible, setStyleVisible] = React.useState(false);
    const hasActiveGroup = !!props.activeGroup;

    return (
        <Panel position="top-right">
            {/* Style button */}
            <PanelButton active={styleVisible} onClick={() => setStyleVisible(!styleVisible)}>
                <EditIcon />
            </PanelButton>
            {/* Order buttons
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
            {/* Group selection */}
            <PanelButton disabled={hasActiveGroup || !isGroupSelectionVisible(props.selection)} onClick={props.onGroupSelectionClick}>
                <ObjectGroupIcon />
            </PanelButton>
            {/* Ungroup selection */}
            <PanelButton disabled={hasActiveGroup || !isUngroupSelectionVisible(props.selection)} onClick={props.onUngroupSelectionClick}>
                <ObjectUngroupIcon />
            </PanelButton>
            {/* Remove current selection */}
            <PanelButton disabled={!props.selection || props.selection.length === 0} onClick={props.onRemoveClick}>
                <TrashIcon />
            </PanelButton>
        </Panel>
    );
};

EditionPanel.defaultProps = {
    selection: [],
    activeGroup: null,
    onGroupSelectionClick: null,
    onUngroupSelectionClick: null,
    onRemoveClick: null,
};
