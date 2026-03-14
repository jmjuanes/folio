import React from "react";
import { ACTIONS } from "../../constants.js";
import { useTools } from "../../hooks/use-tools.js";
import { useActions } from "../../hooks/use-actions.js";
import { useEditor } from "../../contexts/editor.jsx";
import { useDialog } from "../../contexts/dialogs.jsx";
import { Dialog } from "../ui/dialog.jsx";
import { getShortcutByAction, printShortcut } from "../../lib/actions.js";

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
    // { id: ACTIONS.SHOW_ACTIONS_PALETTE, label: "Actions Palette" },
];

export const ActionsPaletteDialog = (): React.JSX.Element => {
    const editor = useEditor();
    const tools = useTools();
    const dispatchAction = useActions();
    const { hideDialog } = useDialog();
    const [query, setQuery] = React.useState("");
    const [highlightIndex, setHighlightIndex] = React.useState(0);

    const toolItems = React.useMemo(() => {
        return Object.entries(tools).map(([toolId, toolData]) => ({
            type: "tool",
            id: toolId,
            label: toolData.name || toolData.text || toolId,
            shortcut: toolData.keyboardShortcut ? toolData.keyboardShortcut.toUpperCase() : "",
            icon: toolData.icon,
            disabled: toolData.toolEnabledOnReadOnly === false && editor.page.readonly,
            execute: () => {
                if (!(toolData.toolEnabledOnReadOnly === false && editor.page.readonly)) {
                    toolData.onSelect(editor);
                }
            },
        }));
    }, [tools, editor]);

    const actionItems = React.useMemo(() => {
        return ACTIONS_LIST.map(item => ({
            type: "action",
            id: item.id,
            label: item.label,
            shortcut: getShortcutByAction(item.id),
            execute: () => dispatchAction(item.id),
        }));
    }, [dispatchAction]);

    const allItems = React.useMemo(() => [...actionItems, ...toolItems], [actionItems, toolItems]);
    const normalizedQuery = query.trim().toLowerCase();
    const filteredItems = normalizedQuery
        ? allItems.filter(item => `${item.label} ${item.shortcut || ""}`.toLowerCase().includes(normalizedQuery))
        : allItems;

    React.useEffect(() => setHighlightIndex(0), [filteredItems.length]);

    React.useEffect(() => {
        const handleKeyDown = event => {
            if (event.key === "Escape") return onClose?.();
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
                onClose?.();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [filteredItems, highlightIndex, onClose]);

    const inputRef = React.useRef(null);
    React.useEffect(() => inputRef.current?.focus(), []);

    return (
        <div className="w-full max-w-xl p-4">
            <Dialog.Header>
                <Dialog.Title>Actions Palette</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className="pt-0">
                <input
                    ref={inputRef}
                    className="w-full border-1 border-gray-200 rounded-lg p-2 mb-3"
                    value={query}
                    placeholder="Type a command or tool..."
                    onChange={e => setQuery(e.target.value)}
                />
                <div className="max-h-80 overflow-y-auto border-1 border-gray-200 rounded-lg bg-white">
                    {filteredItems.length === 0 && (
                        <div className="p-3 text-center text-gray-500">No actions found</div>
                    )}
                    {filteredItems.map((item, index) => (
                        <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => {
                                item.execute();
                                onClose?.();
                            }}
                            className={`w-full text-left p-2 flex items-center justify-between ${index === highlightIndex ? "bg-blue-100" : "bg-white"} ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={item.disabled}
                        >
                            <div className="flex items-center gap-2">
                                {item.icon && <span className="text-lg">{typeof item.icon === "string" ? item.icon : item.icon}</span>}
                                <span>{item.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{item.shortcut || ""}</span>
                        </button>
                    ))}
                </div>
            </Dialog.Body>
        </div>
    );
};
