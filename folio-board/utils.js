import {DIALOGS} from "./constants.js";

// Check if dialog is enabled for the provided selection
export const isDialogEnabledForSelection = (dialog, selection) => {
    if (selection.length > 0) {
        return selection.some(el => {
            switch (dialog) {
                case DIALOGS.FILL:
                    return typeof el.fillColor !== "undefined";
                case DIALOGS.STROKE:
                    return typeof el.strokeColor !== "undefined";
                case DIALOGS.TEXT:
                    return typeof el.textColor !== "undefined";
                case DIALOGS.SHAPE:
                    return typeof el.shape !== "undefined";
                case DIALOGS.ARROWHEAD:
                    return typeof el.startArrowhead !== "undefined";
                default:
                    return false;
            }
        });
    }
    // Dialog is enabled
    return true;
};
