import {ELEMENTS, VERSION} from "./constants.js";

export const migrateElements = (prevElements, version = "2") => {
    let elements = prevElements;
    switch (version) {
        case "2":
            // - migrate edgeHanders to edgeXHandlers and edgeYHandlers
            // - the minWidth and minHeight attributes of the text element are deprecated
            elements = elements.map(element => {
                if (element.edgeHandlers) {
                    element.edgeXHandlers = true;
                    element.edgeYHandlers = element.type !== ELEMENTS.TEXT;
                    delete element.edgeHandlers;
                }
                if (element.type === ELEMENTS.TEXT) {
                    delete element.minWidth;
                    delete element.minHeight;
                }
                return element;
            });
    }
    return elements;
};

export const migrate = (prevState, version = "2") => {
    return {
        ...prevState,
        elements: migrateElements(prevState.elements, version),
        version: VERSION,
    };
};
