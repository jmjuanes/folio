import {ARROWHEADS, SHAPES} from "folio-core";
import {defaultStyles} from "./styles.js";

export const getDefaultState = () => ({
    snapshot: null,
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
    activeDialog: null,
    zoom: 1,
    translateX: 0,
    translateY: 0,
    lastTranslateX: 0,
    lastTranslateY: 0,
    isDragged: false,
    isResized: false,
    isPrevSelected: false,
    showSettings: false,
    showExport: false,
    grid: true,
    background: "#fafafa",
});
