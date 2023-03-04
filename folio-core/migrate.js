import {ELEMENTS, VERSION} from "./constants.js";

export const migrateElements = (prevElements, version) => {
    let elements = prevElements;
    // switch (version) {
    //     case "2":
    //         // - the minWidth and minHeight attributes of the text element are deprecated
    //         elements = elements.map(element => {
    //             if (element.type === ELEMENTS.TEXT) {
    //                 delete element.minWidth;
    //                 delete element.minHeight;
    //             }
    //             return element;
    //         });
    // }
    return elements;
};

export const migrateAssets = (prevAssets, version) => {
    return prevAssets || {};
};

export const migrate = (state, version = "2") => {
    return {
        ...state,
        elements: migrateElements(state.elements, state.version || version),
        assets: migrateAssets(state.assets, state.version || version),
        version: VERSION,
    };
};
