import {uid} from "uid/secure";
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
    TEXT_VERTICAL_ALIGNS,
    TRANSPARENT,
    BLACK,
    ASSETS,
    MIME_TYPES,
    ARROW_SHAPES,
} from "../constants.js";
import {BACKGROUND_COLORS} from "../utils/colors.js";
import {measureText} from "../utils/math.js";
import {loadImage} from "../utils/image.js";

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
            case "9":
            case "10":
                // imageWidth and imageHeight are deprecated
                if (element.type === ELEMENTS.IMAGE) {
                    delete element.imageWidth;
                    delete element.imageHeight;
                }
            case "11":
                // Arrows now have an 'arrowShape' field
                if (element.type === ELEMENTS.ARROW) {
                    element[FIELDS.ARROW_SHAPE] = element[FIELDS.ARROW_SHAPE] ?? ARROW_SHAPES.LINE;
                }
            case "12":
                // add text vertical align field to shape elements
                if (element.type === ELEMENTS.SHAPE) {
                    element[FIELDS.TEXT_VERTICAL_ALIGN] = element[FIELDS.TEXT_VERTICAL_ALIGN] ?? TEXT_VERTICAL_ALIGNS.MIDDLE;
                }
        }
        return element;
    });
};

export const migrateAssets = async (assets, version) => {
    const entries = Object.entries(assets || {});
    for (let i = 0; i < entries.length; i++) {
        const asset = entries[i];
        switch(version) {
            case "7":
            case "8":
            case "9":
            case "10":
                // We have to migrate all assets to images
                const img = await loadImage(asset[1].dataUrl);
                asset[1] = {
                    type: ASSETS.IMAGE,
                    data: {
                        mimeType: asset[1].type || MIME_TYPES.PNG,
                        src: asset[1].dataUrl,
                        width: img.width ?? 0,
                        height: img.height ?? 0,
                        size: asset[1].size,
                    },
                };
        }
    }
    return Object.fromEntries(entries);
};

// @private migrate pages to new version
export const migratePages = (data, version) => {
    // Check if pages are not defined but we have old elements
    if (!data?.pages && data?.elements) {
        return [{
            id: uid(20),
            title: "Page 1",
            elements: migrateElements(data?.elements, version),
        }];
    }
    // migrate pages
    return (data?.pages || []).map(page => {
        return {
            ...page,
            elements: migrateElements(page.elements, version),
        };
    });
};

// @private migrate appState object
export const migrateAppState = (appState, version) => {
    return appState ?? {};
};

// @public migrate data to latest version
export const migrate = async (data = {}, version = "2") => {
    const assets = await migrateAssets(data?.assets , data?.version || version);
    return {
        version: VERSION,
        title: data?.title || "Untitled",
        createdAt: data?.createdAt ?? Date.now(),
        updatedAt: data?.updatedAt ?? Date.now(),
        pages: migratePages(data, data?.version || version),
        assets: assets,
        background: data.background ?? BACKGROUND_COLORS.gray,
        appState: migrateAppState(data?.appState, data?.version || version),
        metadata: data?.metadata ?? {},
    };
};
