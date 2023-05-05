import {ELEMENTS, VERSION, BACKGROUND_COLORS} from "./constants.js";

export const migrateElements = (data, version) => {
    return (data.elements || []).map(element => {
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
                    // element.edgeHandlers = true;
                    // element.cornerHandlers = true;
                    element.drawWidth = Math.abs(element.x2 - element.x1);
                    element.drawHeight = Math.abs(element.y2 - element.y1);
                }
            case "3":
                // new field group
                // edgeHandlers, cornerHandlers and nodeHandlers have been deprecated
                element.group = element.group || null;
                delete element.edgeHandlers;
                delete element.cornerHandlers;
                delete element.nodeHandlers;
        }
        return element;
    });
};

export const migrateAssets = (data, version) => {
    return data.assets || {};
};

export const migrate = (data, version = "2") => {
    return {
        ...data,
        elements: migrateElements(data, data.version || version),
        assets: migrateAssets(data, data.version || version),
        grid: data.grid ?? false,
        background: data.background || BACKGROUND_COLORS.GRAY,
        version: VERSION,
    };
};
