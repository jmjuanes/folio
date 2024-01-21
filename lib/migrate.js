import {
    ELEMENTS,
    VERSION,
    FIELDS,
    DEPRECATED_FIELDS,
    DEFAULTS,
    FILL_STYLES,
    STROKES,
    FONT_FACES,
    NOTE_MIN_WIDTH,
    NOTE_MIN_HEIGHT,
    NOTE_PADDING,
    NOTE_TEXT_FONT,
    NOTE_TEXT_SIZE,
    TRANSPARENT,
    BLACK,
} from "@lib/constants.js";
import {BACKGROUND_COLORS} from "@lib/utils/colors.js";
import {measureText} from "@lib/utils/math.js";

export const migrateElements = (elements, version) => {
    return (elements || []).map((element, index) => {
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
            case "7":
                // Add new 'order' field to all elements
                element[FIELDS.ORDER] = index;
                // Transparent colors in fill or stroke should be converted to fill or stroke style
                if (element.type === ELEMENTS.SHAPE) {
                    if (element[FIELDS.FILL_COLOR] === TRANSPARENT) {
                        element[FIELDS.FILL_COLOR] = BLACK;
                        element[FIELDS.FILL_STYLE] = FILL_STYLES.NONE;
                    }
                    if (element[FIELDS.STROKE_COLOR] === TRANSPARENT) {
                        element[FIELDS.STROKE_COLOR] = BLACK;
                        element[FIELDS.STROKE_STYLE] = STROKES.NONE;
                    }
                    // Prevent having elements with fill and stroke none
                    if (element[FIELDS.FILL_STYLE] === FILL_STYLES.NONE && element[FIELDS.STROKE_STYLE] === STROKES.NONE) {
                        element[FIELDS.STROKE_STYLE] = STROKES.SOLID;
                    }
                }
                // Remove the transparent color in stroke
                else if (element[FIELDS.STROKE_COLOR] === TRANSPARENT) {
                    element[FIELDS.STROKE_COLOR] = BLACK;
                }
            case "8":
                // Migrate note elements to new fields
                if (element.type === ELEMENTS.NOTE) {
                    const textHeight = measureText(element.text || " ", NOTE_TEXT_SIZE, NOTE_TEXT_FONT, (NOTE_MIN_WIDTH - 2 * NOTE_PADDING) + "px")[1];
                    element[FIELDS.NOTE_TEXT] = element.text || "";
                    element.x2 = element.x1 + NOTE_MIN_WIDTH;
                    element.y2 = element.y1 + Math.max(NOTE_MIN_HEIGHT, textHeight + 2 * NOTE_PADDING);
                    delete element.text;
                    delete element.textWidth;
                    delete element.textHeight;
                }
                // New locked field
                element[FIELDS.LOCKED] = element[FIELDS.LOCKED] || false;
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
        source: data?.source || null,
        title: data?.title || "Untitled",
        thumbnail: data?.thumbnail || null,
        createdAt: data?.createdAt ?? Date.now(),
        updatedAt: data?.updatedAt ?? Date.now(),
        elements: migrateElements(data.elements, data.version || version),
        assets: migrateAssets(data.assets, data.version || version),
        background: data.background ?? BACKGROUND_COLORS.gray,
        grid: !!data?.grid,
        // attributes: data?.attributes || {},
    };
};
