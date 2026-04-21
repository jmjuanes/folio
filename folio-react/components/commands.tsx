import { Fragment, useState, useRef, useMemo, useCallback, useEffect } from "react";
import { renderIcon } from "@josemi-icons/react";
import { useTools } from "../contexts/tools.tsx";
import { useActions, ActionCategory } from "../contexts/actions.tsx";
import { useEditor } from "../contexts/editor.tsx";
import { useView } from "../contexts/workbench.tsx";
import { Command } from "./ui/command.tsx";
import { Centered } from "./ui/centered.tsx";
import { Dialog } from "./ui/dialog.tsx";
import { Overlay, OverlayVariant } from "./ui/overlay.tsx";
import { useEscapeKey } from "../hooks/use-key.ts";
import type { JSX } from "react";
import type { ActionItem } from "../contexts/actions.tsx";

export type CommandItem = {
    id: string;
    label: string;
    shortcut?: string | string[];
    icon?: React.JSX.Element | string;
    disabled?: boolean;
    execute: () => void;
};

export type CommandGroup = {
    label: string;
    items: CommandItem[];
};

// Command component
const CommandItemWrapper = (props: any): JSX.Element => (
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

export const CommandsContent = (): JSX.Element => {
    const editor = useEditor();
    const view = useView();
    const { getTools } = useTools();
    const { getActions } = useActions();
    const [query, setQuery] = useState<string>("");
    const [highlightIndex, setHighlightIndex] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null); // ref to the list container
    const commandToExecute = useRef<CommandItem | null>(null);

    const toolItems = useMemo<CommandItem[]>(() => {
        return getTools().map(toolData => ({
            id: toolData.id,
            label: toolData.name || toolData.id,
            shortcut: toolData.shortcut ? toolData.shortcut.toUpperCase() : "",
            icon: toolData.icon,
            disabled: toolData.allowedInReadonly === false && editor.page.readonly,
            execute: () => {
                if (!(toolData.allowedInReadonly === false && editor.page.readonly)) {
                    toolData.onSelect();
                }
            },
        } as CommandItem));
    }, [getTools, editor]);

    // join all available actions and tools into a single list and filter based on the query
    const groups = useMemo<CommandGroup[]>(() => {
        // 1. get only the actions that has a category and an associated name
        const availableActions = getActions().filter((action: ActionItem) => {
            return !!action.category && !!action.name;
        });
        // 2. group action items
        const actionCommands: CommandGroup[] = Object.values(ActionCategory).map((category: string) => {
            const actions = availableActions.filter(action => action.category === category);
            return {
                label: category,
                items: actions.map(action => ({
                    id: action.id,
                    label: action.name,
                    icon: action.icon,
                    shortcut: action.shortcut,
                    execute: () => action.onSelect(),
                })),
            } as CommandGroup;
        });
        // 3. merge with tools
        return [
            {
                label: "Tools",
                items: toolItems,
            },
            ...actionCommands.filter(command => command.items.length > 0),
        ];
    }, [toolItems, getActions]);

    // get filtered items based on the query - match against label and shortcut
    const filteredGroups = useMemo<CommandGroup[]>(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (normalizedQuery) {
            const groupsWithFilteredItems = groups.map(group => {
                return Object.assign({}, group, {
                    items: group.items.filter(item => {
                        return [group.label, item.label, item.shortcut || ""].join(" ").toLowerCase().includes(normalizedQuery);
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
    const filteredItems = useMemo<CommandItem[]>(() => {
        return filteredGroups.flatMap(group => group.items);
    }, [filteredGroups]);

    // callback listener to run the specified command
    const executeCommand = useCallback((command: CommandItem) => {
        commandToExecute.current = command; // set the provided command to execute
        view.close();
    }, [view]);

    // reset the highlight index when the filtered items change to avoid out of bounds issues
    useEffect(() => setHighlightIndex(0), [filteredItems.length]);

    // when the component is mounted, listen to keydown events for navigation and execution
    useEffect(() => {
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

    useEffect(() => {
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
    useEffect(() => {
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

export const Commands = (props: CommandsProps): JSX.Element => {
    const view = useView();
    const content = props.children ?? <CommandsContent />;

    // automatically hide the commands when the Escape key is pressed
    useEscapeKey(() => view.close());

    return (
        <Fragment>
            <Overlay variant={OverlayVariant.WHITE} className="z-50" onClick={() => view.close()} />
            <Centered className="fixed z-50" style={{ top: "33%" }}>
                <Dialog.Content className="w-full max-w-md">
                    <div className="p-2">
                        {content}
                    </div>
                </Dialog.Content>
            </Centered>
        </Fragment>
    );
};  
