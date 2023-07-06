import {ELEMENTS, VERSION} from "./constants.js";
import {FIELDS, DEPRECATED_FIELDS, DEFAULTS, FONT_FACES} from "./constants.js";

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
                // new field group (DEPRECATED IN v5)
                // edgeHandlers, cornerHandlers and nodeHandlers have been deprecated
                // element.group = element.group || null;
                delete element.edgeHandlers;
                delete element.cornerHandlers;
                delete element.nodeHandlers;
            case "4":
                // deprecated group, fillOpacity and strokeOpacity fields
                // new fields: opacity
                element[FIELDS.OPACITY] = DEFAULTS.OPACITY;
                delete element[DEPRECATED_FIELDS.GROUP];
                delete element[DEPRECATED_FIELDS.FILL_OPACITY];
                delete element[DEPRECATED_FIELDS.STROKE_OPACITY];
            case "5":
                // Make sure that 'blur' field is removed, as this field has been deprecated
                if (typeof element[DEPRECATED_FIELDS.BLUR] !== "undefined") {
                    delete element[DEPRECATED_FIELDS.BLUR];
                }
                // Added new fillStyle field to shape elements
                if (element.type === ELEMENTS.SHAPE) {
                    element[FIELDS.FILL_STYLE] = DEFAULTS.FILL_STYLE;
                }
            case "6":
                // Migrate 'Caveat' font to 'Caveat Brush'
                if (typeof element[FIELDS.TEXT_FONT] === "string" && element[FIELDS.TEXT_FONT].startsWith("Caveat")) {
                    element[FIELDS.TEXT_FONT] = FONT_FACES.DRAW;
                }
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
