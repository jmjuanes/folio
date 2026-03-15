import React from "react";
import { renderIcon } from "@josemi-icons/react";
import { ACTIONS } from "../../constants.js";
import { useTools } from "../../hooks/use-tools.ts";
import { useActions } from "../../hooks/use-actions.js";
import { useEditor } from "../../contexts/editor.jsx";
import { useDialog } from "../../contexts/dialogs.tsx";
import { Command } from "../ui/command.tsx";
import { getShortcutByAction } from "../../lib/actions.js";

const ACTIONS_LIST = [
    { id: ACTIONS.CUT, label: "Cut" },
    { id: ACTIONS.COPY, label: "Copy" },
    { id: ACTIONS.PASTE, label: "Paste" },
    { id: ACTIONS.UNDO, label: "Undo" },
    { id: ACTIONS.REDO, label: "Redo" },
    { id: ACTIONS.SELECT_ALL, label: "Select All" },
    { id: ACTIONS.DELETE_SELECTION, label: "Delete Selection" },
    { id: ACTIONS.DUPLICATE_SELECTION, label: "Duplicate Selection" },
    { id: ACTIONS.GROUP_SELECTION, label: "Group Selection" },
    { id: ACTIONS.UNGROUP_SELECTION, label: "Ungroup Selection" },
    { id: ACTIONS.ZOOM_IN, label: "Zoom In" },
    { id: ACTIONS.ZOOM_OUT, label: "Zoom Out" },
    { id: ACTIONS.TOGGLE_GRID, label: "Toggle Grid" },
    { id: ACTIONS.TOGGLE_SNAP_TO_ELEMENTS, label: "Toggle Snap to Elements" },
    { id: ACTIONS.TOGGLE_SHOW_DIMENSIONS, label: "Toggle Show Dimensions" },
    { id: ACTIONS.SHOW_KEYBOARD_SHORTCUTS_DIALOG, label: "Keyboard Shortcuts" },
];

export enum CommandType {
    TOOL = "tool",
    ACTION = "action"
};

export type CommandItem = {
    type: CommandType;
    id: string;
    label: string;
    shortcut?: string;
    icon?: React.JSX.Element | string;
    disabled?: boolean;
    execute: () => void;
};

// Command component
const CommandItemWrapper = (props: any): React.JSX.Element => (
    <Command.Item active={props.active} disabled={props.disabled} onClick={props.onClick}>
        <div className="text-lg flex">
            {props.icon && renderIcon(props.icon)}
        </div>
        <div className="">{props.label}</div>
        {props.shortcut && (
            <Command.Shortcut shortcut={props.shortcut} />
        )}
    </Command.Item>
);

export const Commands = (): React.JSX.Element => {
    const editor = useEditor();
    const tools = useTools();
    const dispatchAction = useActions();
    const { hideDialog } = useDialog();
    const [query, setQuery] = React.useState<string>("");
    const [highlightIndex, setHighlightIndex] = React.useState<number>(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const toolItems = React.useMemo<CommandItem[]>(() => {
        return Object.entries(tools).map(([toolId, toolData]) => ({
            type: CommandType.TOOL,
            id: toolId,
            label: toolData.name || toolId,
            shortcut: toolData.keyboardShortcut ? toolData.keyboardShortcut.toUpperCase() : "",
            icon: toolData.icon,
            disabled: toolData.toolEnabledOnReadOnly === false && editor.page.readonly,
            execute: () => {
                if (!(toolData.toolEnabledOnReadOnly === false && editor.page.readonly)) {
                    toolData.onSelect(editor);
                }
            },
        } as CommandItem));
    }, [tools, editor]);

    const actionItems = React.useMemo<CommandItem[]>(() => {
        return ACTIONS_LIST.map(item => ({
            type: CommandType.ACTION,
            id: item.id,
            label: item.label,
            shortcut: getShortcutByAction(item.id),
            execute: () => dispatchAction(item.id),
        } as CommandItem));
    }, [dispatchAction]);

    // join all available actions and tools into a single list and filter based on the query
    const allItems = React.useMemo<CommandItem[]>(() => {
        return [...actionItems, ...toolItems];
    }, [actionItems, toolItems]);

    // get filtered items based on the query - match against label and shortcut
    const filteredItems = React.useMemo<CommandItem[]>(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (normalizedQuery) {
            return allItems.filter(item => {
                return `${item.label} ${item.shortcut || ""}`.toLowerCase().includes(normalizedQuery);
            })
        }
        // no query to apply, return all available items
        return allItems;
    }, [query, allItems]);

    // reset the highlight index when the filtered items change to avoid out of bounds issues
    React.useEffect(() => setHighlightIndex(0), [filteredItems.length]);

    // when the component is mounted, listen to keydown events for navigation and execution
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                return hideDialog();
            }
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlightIndex(i => Math.min(i + 1, filteredItems.length - 1));
                return;
            }
            if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlightIndex(i => Math.max(i - 1, 0));
                return;
            }
            if (event.key === "Enter") {
                event.preventDefault();
                filteredItems[highlightIndex]?.execute();
                hideDialog();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [filteredItems, highlightIndex, hideDialog]);

    // when the component is mounted, focus the input field to allow immediate typing
    React.useEffect(() => inputRef.current?.focus(), []);

    return (
        <Command.Content className="max-w-xl">
            <Command.Input
                value={query}
                focus={true}
                placeholder="Type a command or tool..."
                onChange={value => setQuery(value)}
            />
            <Command.List>
                {filteredItems.length === 0 && (
                    <Command.Empty>No results found.</Command.Empty>
                )}
                {filteredItems.map((commandItem: CommandItem, index: number) => (
                    <CommandItemWrapper
                        key={`${commandItem.id}-${index}`}
                        active={index === highlightIndex}
                        disabled={!!commandItem.disabled}
                        icon={commandItem.icon}
                        label={commandItem.label}
                        shortcut={commandItem.shortcut}
                        onClick={() => {
                            commandItem.execute();
                            hideDialog();
                        }}
                    />
                ))}
            </Command.List>
        </Command.Content>
    );
};
