import { CHANGES, GRID_SIZE, SNAP_THRESHOLD } from "../../constants.js";

// @description remove the provided text element from editor and history
// @param {editor} editor - the current editor instance
// @param {element} element - the text element to remove 
export const removeTextElement = (editor: any, element: any) => {
    const history = editor.getHistory();
    if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
        history.shift();
    }
    editor.removeElements([element]);
    editor.dispatchChange();
};

// @description calculate the snapped coordinate of a value
// @param {number} pos - the coordinate to snap
// @param {boolean} grid - whether grid is enabled
// @param {boolean} snapToElements - whether snap to elements is enabled
// @param {any[]} snapEdges - the available snap edges
// @param {any[]} activeSnapEdges - the active snap edges (will be mutated)
// @param {string | null} edge - the edge to snap to
// @param {number} elementSize - the size of the element
// @param {boolean} includeCenter - whether to include the center of the element in snapping
// @returns {number} the snapped coordinate
export const getSnappedCoordinate = (
    pos: number,
    grid: boolean = false,
    snapToElements: boolean = false,
    snapEdges: any[] = [],
    activeSnapEdges: any[] = [],
    edge: string | null = null,
    elementSize: number = 0,
    includeCenter: boolean = false
): number => {
    // 1. check if grid is enabled
    if (grid) {
        return Math.round(pos / GRID_SIZE) * GRID_SIZE;
    }
    // 2. check if there are snap edges and snap to elements is enabled
    if (edge && snapToElements && snapEdges.length > 0) {
        const edges = elementSize > 0 ? (includeCenter ? [0, elementSize / 2, elementSize] : [0, elementSize]) : [0];
        for (let i = 0; i < snapEdges.length; i++) {
            const item = snapEdges[i];
            if (item.edge === edge && typeof item[edge] !== "undefined") {
                for (let j = 0; j < edges.length; j++) {
                    if (Math.abs(item[edge] - pos - edges[j]) < SNAP_THRESHOLD) {
                        activeSnapEdges.push(item);
                        return item[edge] - edges[j];
                    }
                }
            }
        }
    }
    // 3. other case, return the original position
    return pos;
};
