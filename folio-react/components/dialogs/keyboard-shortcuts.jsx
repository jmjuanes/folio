import React from "react";
import {ACTIONS} from "../../constants.js";
import {useTools} from "../../hooks/use-tools.js";
import {getShortcutByAction, printShortcut} from "../../lib/actions.js";

// @description keyboard shortcuts section
const KeyboardShortcutsGroup = props => (
    <div className="mb-4" style={{breakInside: "avoid-column"}}>
        <div className="text-2xs text-neutral-600 font-bold mb-1">
            {props.label || props.title || ""}
        </div>
        {props.children}
    </div>
);

// @description keyboard shortcuts item
const KeyboardShortcutsItem = props => {
    const shortcut = React.useMemo(() => {
        return props.action ? getShortcutByAction(props.action) : props.shortcut;
    }, [props.action, props.shortcut]);

    return (
        <div className="flex items-center justify-between py-1">
            <div className="text-sm">
                {props.label || ""}
            </div>
            {shortcut && (
                <div className="text-2xs text-neutral-600 font-bold">
                    {printShortcut(shortcut)}
                </div>
            )}
        </div>
    );
};

// @description content of the keyboard shortcuts dialog
export const KeyboardShortcutsDialogContent = () => {
    const tools = useTools();
    const toolsShortcuts = React.useMemo(() => {
        return Object.values(tools)
            .filter(tool => !!tool.keyboardShortcut)
            .map(tool => {
                return {
                    label: tool.name,
                    shortcut: tool.keyboardShortcut.toUpperCase(),
                };
            });
    }, [tools]);

    return (
        <React.Fragment>
            <KeyboardShortcutsGroup title="Drawing">
                <KeyboardShortcutsItem action={ACTIONS.OPEN} label="Open" />
                <KeyboardShortcutsItem action={ACTIONS.SAVE} label="Save" />
                <KeyboardShortcutsItem action={ACTIONS.EXPORT_IMAGE} label="Export as Image" />
                <KeyboardShortcutsItem action={ACTIONS.CLEAR} label="Clear all" />
            </KeyboardShortcutsGroup>
            <KeyboardShortcutsGroup title="Actions">
                <KeyboardShortcutsItem action={ACTIONS.CUT} label="Cut" />
                <KeyboardShortcutsItem action={ACTIONS.COPY} label="Copy" />
                <KeyboardShortcutsItem action={ACTIONS.PASTE} label="Paste" />
                <KeyboardShortcutsItem action={ACTIONS.UNDO} label="Undo" />
                <KeyboardShortcutsItem action={ACTIONS.REDO} label="Redo" />
            </KeyboardShortcutsGroup>
            <KeyboardShortcutsGroup title="Selection">
                <KeyboardShortcutsItem action={ACTIONS.SELECT_ALL} label="Select All" />
                <KeyboardShortcutsItem action={ACTIONS.DELETE_SELECTION} label="Delete" />
                <KeyboardShortcutsItem action={ACTIONS.DUPLICATE_SELECTION} label="Duplicate" />
                <KeyboardShortcutsItem action={ACTIONS.GROUP_SELECTION} label="Group" />
                <KeyboardShortcutsItem action={ACTIONS.UNGROUP_SELECTION} label="Ungroup" />
                <KeyboardShortcutsItem action={ACTIONS.BRING_FORWARD} label="Bring Forward" />
                <KeyboardShortcutsItem action={ACTIONS.BRING_TO_FRONT} label="Bring to Front" />
                <KeyboardShortcutsItem action={ACTIONS.SEND_BACKWARD} label="Send Backward" />
                <KeyboardShortcutsItem action={ACTIONS.SEND_TO_BACK} label="Send to Back" />
                <KeyboardShortcutsItem action={ACTIONS.LOCK_SELECTION} label="Lock" />
                <KeyboardShortcutsItem action={ACTIONS.UNLOCK_SELECTION} label="Unlock" />
            </KeyboardShortcutsGroup>
            {toolsShortcuts.length > 0 && (
                <KeyboardShortcutsGroup title="Tools">
                    {toolsShortcuts.map(tool => (
                        <KeyboardShortcutsItem key={tool.label} label={tool.label} shortcut={tool.shortcut} />
                    ))}
                </KeyboardShortcutsGroup>
            )}
            <KeyboardShortcutsGroup title="Pages">
                <KeyboardShortcutsItem action={ACTIONS.CREATE_PAGE} label="Create Page" />
                <KeyboardShortcutsItem action={ACTIONS.DUPLICATE_PAGE} label="Duplicate Page" />
                <KeyboardShortcutsItem action={ACTIONS.DELETE_PAGE} label="Delete Page" />
                <KeyboardShortcutsItem action={ACTIONS.CLEAR_PAGE} label="Clear Page" />
                <KeyboardShortcutsItem action={ACTIONS.PREVIOUS_PAGE} label="Previous Page" />
                <KeyboardShortcutsItem action={ACTIONS.NEXT_PAGE} label="Next Page" />
            </KeyboardShortcutsGroup>
            <KeyboardShortcutsGroup title="Zoom">
                <KeyboardShortcutsItem action={ACTIONS.ZOOM_IN} label="Zoom In" />
                <KeyboardShortcutsItem action={ACTIONS.ZOOM_OUT} label="Zoom Out" />
                <KeyboardShortcutsItem action={ACTIONS.ZOOM_RESET} label="Reset Zoom" />
                <KeyboardShortcutsItem action={ACTIONS.ZOOM_FIT} label="Fit" />
                <KeyboardShortcutsItem action={ACTIONS.ZOOM_FIT_SELECTION} label="Fit to Selection" />
            </KeyboardShortcutsGroup>
            <KeyboardShortcutsGroup title="Settings">
                <KeyboardShortcutsItem action={ACTIONS.TOGGLE_GRID} label="Grid" />
                <KeyboardShortcutsItem action={ACTIONS.TOGGLE_SNAP_TO_ELEMENTS} label="Snap to Elements" />
                <KeyboardShortcutsItem action={ACTIONS.TOGGLE_SHOW_DIMENSIONS} label="Object Dimensions" />
            </KeyboardShortcutsGroup>
        </React.Fragment>
    );
};

export const KeyboardShortcutsDialog = () => {
    return (
        <div className="max-h-96 overflow-y-auto">
            <div className="gap-4" style={{columns: "2", columnGap: "4rem"}}>
                <KeyboardShortcutsDialogContent />
            </div>
        </div>
    );
};
