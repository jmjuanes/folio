import {IS_DARWIN, ACTIONS} from "../constants.js";
import {getKeyFromKeyCode} from "../utils/keys.js";

// @description utility function to get the correct shortcut key
const getShortcutKey = command => {
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
    [ACTIONS.CLEAR]: getShortcutKey("CtrlOrCmd+Shift+Delete"),

    [ACTIONS.SELECT_ALL]: getShortcutKey("CtrlOrCmd+A"),
    [ACTIONS.DELETE_SELECTION]: [
        getShortcutKey("Delete"),
        getShortcutKey("Backspace"),
    ],
    [ACTIONS.DUPLICATE_SELECTION]: getShortcutKey("CtrlOrCmd+D"),
    [ACTIONS.GROUP_SELECTION]: getShortcutKey("CtrlOrCmd+G"),
    [ACTIONS.UNGROUP_SELECTION]: getShortcutKey("CtrlOrCmd+Shift+G"),
    [ACTIONS.BRING_FORWARD]: getShortcutKey("CtrlOrCmd+]"),
    [ACTIONS.BRING_TO_FRONT]: getShortcutKey("CtrlOrCmd+Shift+]"),
    [ACTIONS.SEND_BACKWARD]: getShortcutKey("CtrlOrCmd+["),
    [ACTIONS.SEND_TO_BACK]: getShortcutKey("CtrlOrCmd+Shift+["),
    [ACTIONS.LOCK_SELECTION]: getShortcutKey("CtrlOrCmd+L"),
    [ACTIONS.UNLOCK_SELECTION]: getShortcutKey("CtrlOrCmd+Shift+L"),

    [ACTIONS.ZOOM_IN]: getShortcutKey("CtrlOrCmd++"),
    [ACTIONS.ZOOM_OUT]: getShortcutKey("CtrlOrCmd+-"),
    [ACTIONS.ZOOM_RESET]: getShortcutKey("CtrlOrCmd+0"),
    [ACTIONS.ZOOM_FIT]: getShortcutKey("CtrlOrCmd+1"),
    [ACTIONS.ZOOM_FIT_SELECTION]: getShortcutKey("CtrlOrCmd+2"),

    [ACTIONS.CREATE_PAGE]: getShortcutKey("CtrlOrCmd+M"),
    [ACTIONS.DUPLICATE_PAGE]: getShortcutKey("CtrlOrCmd+Shift+M"),
    [ACTIONS.DELETE_PAGE]: getShortcutKey("CtrlOrCmd+B"),
    [ACTIONS.CLEAR_PAGE]: getShortcutKey("CtrlOrCmd+Shift+B"),
    [ACTIONS.PREVIOUS_PAGE]: getShortcutKey("CtrlOrCmd+{"),
    [ACTIONS.NEXT_PAGE]: getShortcutKey("CtrlOrCmd+}"),

    [ACTIONS.TOGGLE_GRID]: getShortcutKey("CtrlOrCmd+'"),
    [ACTIONS.TOGGLE_SNAP_TO_ELEMENTS]: getShortcutKey("Alt+S"),
    [ACTIONS.TOGGLE_SHOW_DIMENSIONS]: getShortcutKey("Alt+D"),

    [ACTIONS.SHOW_EXPORT_DIALOG]: getShortcutKey("CtrlOrCmd+Shift+E"),
};

// @description get shortcut key for the provided action
// @param {string} actionName - action name to get the shortcut
// @returns {string} - shortcut key
export const getShortcutByAction = actionName => {
    return shortcutsMap[actionName] || null;
};

// @description get action name by the provided key combination
// @param {string} key - key pressed by the user
// @param {boolean} ctrlKey - ctrl key pressed (in DARWIN this is Cmd key)
// @param {boolean} shiftKey - shift key pressed
// @param {boolean} altKey - alt key pressed (in DARWIN this is Opt key)
// @returns {string} - action name
export const getActionByKeysCombination = (key = "", keyCode = "", ctrlKey = false, altKey = false, shiftKey = false) => {
    // build the shortcut command
    const shortcutCommand = [
        ctrlKey && !IS_DARWIN ? "Ctrl" : "",
        ctrlKey && IS_DARWIN ? "Cmd" : "",
        altKey && IS_DARWIN ? "Opt" : "",
        altKey && !IS_DARWIN ? "Alt" : "",
        shiftKey ? "Shift" : "",
        (altKey ? getKeyFromKeyCode(keyCode) : key).toUpperCase(),
    ];
    const shortcut = shortcutCommand.filter(Boolean).join("+");
    // find the action name by the shortcut
    return Object.keys(shortcutsMap).find(actionName => {
        return [shortcutsMap[actionName]].flat().some(shortcutKey => {
            return shortcutKey === shortcut || shortcutKey.toUpperCase() === shortcut;
        });
    });
};

// @description print shortcut
// @param {string} shortcut - shortcut key
// @returns {string} - formatted shortcut
export const printShortcut = shortcut => {
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
