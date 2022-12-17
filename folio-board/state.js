import {ARROWHEADS, SHAPES, ZOOM_INITIAL} from "./constants.js";
import {defaultStyles} from "./styles.js";

export const getDefaultState = () => ({
    elements: [],
    settings: {},
    snapshot: null,
    history: [],
    historyIndex: 0,
    style: {
        ...defaultStyles,
        shape: SHAPES.RECTANGLE,
        startArrowhead: ARROWHEADS.NONE,
        endArrowhead: ARROWHEADS.NONE,
    },
    selection: null,
    activeTool: null,
    activeAction: null,
    activeElement: null,
    activeGroup: null,
    zoom: ZOOM_INITIAL,
    translateX: 0,
    translateY: 0,
    lastTranslateX: 0,
    lastTranslateY: 0,
    isDragged: false,
    isResized: false,
    isPrevSelected: false,
});

export const cleanStateForExport = state => ({});
