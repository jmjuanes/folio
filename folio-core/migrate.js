import {ELEMENTS, VERSION, BACKGROUND_COLORS} from "./constants.js";

export const migrateElements = (prevElements, version) => {
    return (prevElements || []).map(element => {
        switch (version) {
            case "2":
                // - the minWidth and minHeight attributes of the text element are deprecated
                // - enable edgeHandlers and corderHandlers in draw elements
                // - add new drawWidth and drawHeight attributes in draw elements
                if (element.type === ELEMENTS.TEXT) {
                    delete element.minWidth;
                    delete element.minHeight;
                }
                else if (element.type === ELEMENTS.DRAW) {
                    element.edgeHandlers = true;
                    element.cornerHandlers = true;
                    element.drawWidth = Math.abs(element.x2 - element.x1);
                    element.drawHeight = Math.abs(element.y2 - element.y1);
                }
        }
        return element;
    });
};

export const migrateAssets = (prevAssets, version) => {
    return prevAssets || {};
};

export const migrate = (state, version = "2") => {
    return {
        ...state,
        elements: migrateElements(state.elements, state.version || version),
        assets: migrateAssets(state.assets, state.version || version),
        grid: state.grid ?? false,
        lockTool: state.lockTool ?? false,
        background: state.background ?? BACKGROUND_COLORS.GRAY,
        version: VERSION,
    };
};
