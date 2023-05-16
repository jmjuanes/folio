import {ELEMENTS, VERSION} from "./constants.js";

export const migrateElements = (elements, version) => {
    return (elements || []).map(element => {
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

export const migrateAssets = (assets, version) => {
    return assets || {};
};

export const migrate = (data, version = "2") => {
    return {
        version: VERSION,
        elements: migrateElements(data.elements, data.version || version),
        assets: migrateAssets(data.assets, data.version || version),
    };
};
