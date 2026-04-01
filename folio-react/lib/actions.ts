import { IS_DARWIN, ACTIONS } from "../constants.js";
import { getKeyFromKeyCode } from "../utils/keys.js";

// @description utility function to get the correct shortcut key
export const getShortcutKey = (command: string): string => {
    if (IS_DARWIN) {
        return command.replace(/\bCtrlOrCmd\b/gi, "Cmd").replace(/\bAlt\b/gi, "Opt");
    }
    return command.replace(/\bCtrlOrCmd\b/gi, "Ctrl");
};

// shortcuts map
export const shortcutsMap = {
    [ACTIONS.CUT]: getShortcutKey("CtrlOrCmd+X"),
    [ACTIONS.COPY]: getShortcutKey("CtrlOrCmd+C"),
    [ACTIONS.PASTE]: getShortcutKey("CtrlOrCmd+V"),

    [ACTIONS.UNDO]: getShortcutKey("CtrlOrCmd+Z"),
    [ACTIONS.REDO]: getShortcutKey("CtrlOrCmd+Shift+Z"),

    [ACTIONS.OPEN]: getShortcutKey("CtrlOrCmd+O"),
    [ACTIONS.SAVE]: getShortcutKey("CtrlOrCmd+S"),
    // [ACTIONS.CLEAR]: getShortcutKey("CtrlOrCmd+Shift+Delete"),

    [ACTIONS.SELECT_ALL]: getShortcutKey("CtrlOrCmd+A"),
    [ACTIONS.DELETE_SELECTION]: [
        getShortcutKey("Delete"),
        getShortcutKey("Backspace"),
    ],
    [ACTIONS.DUPLICATE_SELECTION]: getShortcutKey("CtrlOrCmd+D"),
    [ACTIONS.GROUP_SELECTION]: getShortcutKey("CtrlOrCmd+G"),
    [ACTIONS.UNGROUP_SELECTION]: getShortcutKey("CtrlOrCmd+Shift+G"),
    // [ACTIONS.BRING_FORWARD]: getShortcutKey("CtrlOrCmd+]"),
    // [ACTIONS.BRING_TO_FRONT]: getShortcutKey("CtrlOrCmd+Shift+]"),
    // [ACTIONS.SEND_BACKWARD]: getShortcutKey("CtrlOrCmd+["),
    // [ACTIONS.SEND_TO_BACK]: getShortcutKey("CtrlOrCmd+Shift+["),
    [ACTIONS.LOCK_SELECTION]: getShortcutKey("CtrlOrCmd+L"),
    [ACTIONS.UNLOCK_SELECTION]: getShortcutKey("CtrlOrCmd+Shift+L"),

    [ACTIONS.ZOOM_IN]: getShortcutKey("CtrlOrCmd++"),
    [ACTIONS.ZOOM_OUT]: getShortcutKey("CtrlOrCmd+-"),
    // [ACTIONS.ZOOM_RESET]: getShortcutKey("CtrlOrCmd+0"),
    // [ACTIONS.ZOOM_FIT]: getShortcutKey("CtrlOrCmd+1"),
    // [ACTIONS.ZOOM_FIT_SELECTION]: getShortcutKey("CtrlOrCmd+2"),

    // [ACTIONS.CREATE_PAGE]: getShortcutKey("CtrlOrCmd+M"),
    // [ACTIONS.DUPLICATE_PAGE]: getShortcutKey("CtrlOrCmd+Shift+M"),
    // [ACTIONS.DELETE_PAGE]: getShortcutKey("CtrlOrCmd+B"),
    // [ACTIONS.CLEAR_PAGE]: getShortcutKey("CtrlOrCmd+Shift+B"),
    // [ACTIONS.PREVIOUS_PAGE]: getShortcutKey("CtrlOrCmd+{"),
    // [ACTIONS.NEXT_PAGE]: getShortcutKey("CtrlOrCmd+}"),

    // [ACTIONS.TOGGLE_GRID]: getShortcutKey("CtrlOrCmd+'"),
    // [ACTIONS.TOGGLE_SNAP_TO_ELEMENTS]: getShortcutKey("Alt+S"),
    // [ACTIONS.TOGGLE_SHOW_DIMENSIONS]: getShortcutKey("Alt+D"),

    // [ACTIONS.SHOW_EXPORT_DIALOG]: getShortcutKey("CtrlOrCmd+Shift+E"),
    [ACTIONS.SHOW_COMMANDS]: getShortcutKey("CtrlOrCmd+K"),
};

// @description print shortcut
// @param {string} shortcut - shortcut key
// @returns {string} - formatted shortcut
export const printShortcut = (shortcut: string | string[]): string => {
    return [shortcut].flat().map(s => {
        return (s || "")
            .replace(/\b[+]/g, " ")
            .replace(/\bCmd\b/gi, "⌘")
            .replace(/\bOpt\b/gi, "⌥")
            .replace(/\bCtrl\b/gi, "⌃")
            .replace(/\bShift\b/gi, "⇧")
            .replace(/\bBackspace\b/gi, "⌫");
    }).join(", ");
};
