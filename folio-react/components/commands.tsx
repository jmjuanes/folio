import React from "react";
import { renderIcon } from "@josemi-icons/react";
import { ACTIONS } from "../constants.js";
import { useTools } from "../hooks/use-tools.tsx";
import { useActions } from "../hooks/use-actions.js";
import { useEditor } from "../contexts/editor.jsx";
import { useSurface } from "../contexts/surface.tsx";
import { Command } from "./ui/command.tsx";
import { Centered } from "./ui/centered.tsx";
import { Dialog } from "./ui/dialog.tsx";
import { Overlay, OverlayVariant } from "./ui/overlay.tsx";
import { getShortcutByAction } from "../lib/actions.js";

const ACTIONS_LIST = [
    { id: ACTIONS.CUT, label: "Cut", icon: "cut" },
    { id: ACTIONS.COPY, label: "Copy", icon: "copy" },
    { id: ACTIONS.PASTE, label: "Paste", icon: "clipboard" },
    { id: ACTIONS.UNDO, label: "Undo", icon: "history-undo" },
    { id: ACTIONS.REDO, label: "Redo", icon: "history-redo" },
    { id: ACTIONS.SELECT_ALL, label: "Select All", icon: "box-selection" },
    { id: ACTIONS.DELETE_SELECTION, label: "Delete Selection", icon: "trash" },
    { id: ACTIONS.DUPLICATE_SELECTION, label: "Duplicate Selection", icon: "copy" },
    { id: ACTIONS.GROUP_SELECTION, label: "Group Selection", icon: "object-group" },
    { id: ACTIONS.UNGROUP_SELECTION, label: "Ungroup Selection", icon: "object-ungroup" },
    { id: ACTIONS.ZOOM_IN, label: "Zoom In", icon: "zoom-in" },
    { id: ACTIONS.ZOOM_OUT, label: "Zoom Out", icon: "zoom-out" },
    { id: ACTIONS.TOGGLE_GRID, label: "Toggle Grid", icon: "grid" },
    { id: ACTIONS.TOGGLE_SNAP_TO_ELEMENTS, label: "Toggle Snap to Elements", icon: "magnet" },
    { id: ACTIONS.TOGGLE_SHOW_DIMENSIONS, label: "Toggle Show Dimensions", icon: "ruler" },
    { id: ACTIONS.SHOW_KEYBOARD_SHORTCUTS_DIALOG, label: "Keyboard Shortcuts", icon: "keyboard" },
];

export type CommandItem = {
    id: string;
    label: string;
    shortcut?: string;
    icon?: React.JSX.Element | string;
    disabled?: boolean;
    execute: () => void;
};

export type CommandGroup = {
    label: string;
    items: CommandItem[];
};

// Command component
const CommandItemWrapper = (props: any): React.JSX.Element => (
    <Command.Item active={props.active} disabled={props.disabled} onClick={props.onClick}>
        <div className="text-lg flex w-4">
            {props.icon && renderIcon(props.icon)}
        </div>
        <div className="leading-none">
            <span>{props.label}</span>
        </div>
        {props.shortcut && (
            <Command.Shortcut shortcut={props.shortcut} />
        )}
    </Command.Item>
);

export const CommandsContent = (): React.JSX.Element => {
    const editor = useEditor();
    const tools = useTools();
    const dispatchAction = useActions();
    const { clearSurface } = useSurface();
    const [query, setQuery] = React.useState<string>("");
    const [highlightIndex, setHighlightIndex] = React.useState<number>(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null); // ref to the list container
    const commandToExecute = React.useRef<CommandItem | null>(null);

    const toolItems = React.useMemo<CommandItem[]>(() => {
        return Object.entries(tools).map(([toolId, toolData]) => ({
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
            id: item.id,
            label: item.label,
            icon: item.icon,
            shortcut: getShortcutByAction(item.id),
            execute: () => dispatchAction(item.id),
        } as CommandItem));
    }, [dispatchAction]);

    // join all available actions and tools into a single list and filter based on the query
    const groups = React.useMemo<CommandGroup[]>(() => {
        return [
            {
                label: "Tools",
                items: toolItems,
            },
            {
                label: "Actions",
                items: actionItems,
            },
        ];
    }, [actionItems, toolItems]);

    // get filtered items based on the query - match against label and shortcut
    const filteredGroups = React.useMemo<CommandGroup[]>(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (normalizedQuery) {
            const groupsWithFilteredItems = groups.map(group => {
                return Object.assign({}, group, {
                    items: group.items.filter(item => {
                        return `${item.label} ${item.shortcut || ""}`.toLowerCase().includes(normalizedQuery);
                    }),
                });
            });
            // return only the groups with at least one item that matches the current query
            return groupsWithFilteredItems.filter(group => {
                return group.items.length > 0;
            });
        }
        // no query to apply, return all available groups
        return groups;
    }, [query, groups]);

    // get the items flatten
    const filteredItems = React.useMemo<CommandItem[]>(() => {
        return filteredGroups.flatMap(group => group.items);
    }, [filteredGroups]);

    // callback listener to run the specified command
    const executeCommand = React.useCallback((command: CommandItem) => {
        commandToExecute.current = command; // set the provided command to execute
        clearSurface();
    }, [clearSurface]);

    // reset the highlight index when the filtered items change to avoid out of bounds issues
    React.useEffect(() => setHighlightIndex(0), [filteredItems.length]);

    // when the component is mounted, listen to keydown events for navigation and execution
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
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
                executeCommand(filteredItems[highlightIndex]);
                return;
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [filteredItems, highlightIndex, executeCommand]);

    React.useEffect(() => {
        // when the component is mounted, focus the input field to allow immediate typing
        if (inputRef.current) {
            inputRef.current?.focus();
        }
        return () => {
            // when the component is removed from DOM, run the execute method of the selected
            // command (if any)
            if (!!commandToExecute.current && typeof commandToExecute.current?.execute === "function") {
                commandToExecute.current.execute();
            }
        };
    }, []);

    // get the id of the highlighted item
    const highlightedItemId: string | null = filteredItems[highlightIndex]?.id || null;

    // when the highlighted index changes, scroll to display it in the commands list
    React.useEffect(() => {
        if (listRef.current && !!highlightedItemId) {
            const itemElement = listRef.current.querySelector(`div[data-command="${highlightedItemId}"]`);
            if (itemElement) {
                itemElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                });
            }
        }
    }, [highlightIndex]);

    return (
        <Command.Content className="max-w-xl">
            <Command.Input
                value={query}
                focus={true}
                placeholder="Type a command or tool..."
                onChange={value => setQuery(value)}
            />
            <Command.List className="">
                {filteredItems.length === 0 && (
                    <Command.Empty>No results found.</Command.Empty>
                )}
                <div className="flex flex-col gap-4" ref={listRef}>
                    {filteredGroups.map((group: CommandGroup) => (
                        <div className="flex flex-col gap-0" key={group.label}>
                            <Command.Group>{group.label}</Command.Group>
                            {group.items.map((item: CommandItem, index: number) => (
                                <div key={`${item.id}-${index}`} data-command={item.id}>
                                    <CommandItemWrapper
                                        active={item.id === highlightedItemId}
                                        disabled={!!item.disabled}
                                        icon={item.icon}
                                        label={item.label}
                                        shortcut={item.shortcut}
                                        onClick={() => executeCommand(item)}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Command.List>
        </Command.Content>
    );
};

export type CommandsProps = {
    children?: React.ReactNode;
};

export const Commands = (props: CommandsProps): React.JSX.Element => {
    const { clearSurface } = useSurface();
    const content = props.children ?? <CommandsContent />;

    return (
        <React.Fragment>
            <Overlay variant={OverlayVariant.WHITE} className="z-50" onClick={clearSurface} />
            <Centered className="fixed z-50" style={{ top: "33%" }}>
                <Dialog.Content className="w-full max-w-md">
                    <div className="p-2">
                        {content}
                    </div>
                </Dialog.Content>
            </Centered>
        </React.Fragment>
    );
};  
