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
