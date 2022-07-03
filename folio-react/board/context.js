import {
    INTERACTION_MODES,
    ELEMENT_TYPES,
} from "../constants.js";

// Create board context
export const createContext = props => ({
    mode: INTERACTION_MODES.NONE,
    type: ELEMENT_TYPES.SELECTION,
    typeLocked: false,
    currentGroup: null,
    currentElement: null,
    currentElementSelected: false,
    currentElementDragged: false,
    resizeOrientation: null,
    selection: [],
    selectionLocked: false,
    snapshot: [],
    elements: [],
    history: [],
    historyIndex: 0,
    width: props.width || 0,
    height: props.height || 0,
});

