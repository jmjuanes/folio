import { IS_DARWIN } from "../constants.js";

// @description utility function to get the correct shortcut key
export const getShortcutKey = (command: string): string => {
    if (IS_DARWIN) {
        return command.replace(/\bCtrlOrCmd\b/gi, "Cmd").replace(/\bAlt\b/gi, "Opt");
    }
    return command.replace(/\bCtrlOrCmd\b/gi, "Ctrl");
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
