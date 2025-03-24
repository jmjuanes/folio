import {IS_DARWIN, ACTIONS} from "../constants.js";

// @description utility function to get the correct shortcut key
const getShortcutKey = command => {
    if (IS_DARWIN) {
        return command.replace(/\bCtrlOrCmd\b/gi, "Cmd");
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
    [ACTIONS.EXPORT_IMAGE]: getShortcutKey("CtrlOrCmd+Shift+E"),
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
};

// @description get shortcut key for the provided action
// @param {string} actionName - action name to get the shortcut
// @returns {string} - shortcut key
export const getShortcutByAction = actionName => {
    return shortcutsMap[actionName] || null;
};

// @description get action name by the provided key combination
// @param {string} key - key pressed by the user
// @param {boolean} shiftKey - shift key pressed
// @param {boolean} ctrlKey - ctrl key pressed (in DARWIN this is Cmd key)
// @returns {string} - action name
export const getActionByKeysCombination = (key = "", shiftKey = false, ctrlKey = false) => {
    // build the shortcut command
    const shortcutCommand = [
        ctrlKey && !IS_DARWIN ? "Ctrl" : "",
        ctrlKey && IS_DARWIN ? "Cmd" : "",
        shiftKey ? "Shift" : "",
        key.toUpperCase(),
    ];
    const shortcut = shortcutCommand.filter(Boolean).join("+");
    // find the action name by the shortcut
    return Object.keys(shortcutsMap).find(actionName => {
        return [shortcutsMap[actionName]].flat().some(shortcutKey => {
            return shortcutKey === shortcut || shortcutKey.toUpperCase() === shortcut;
        });
    });
};
