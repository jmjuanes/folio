import {
    FIELDS,
    CHANGES,
    ELEMENTS,
    SNAP_EDGE_X,
    SNAP_EDGE_Y,
} from "../../constants.js";
import { getSnappedCoordinate } from "../utils/element.ts";
import { ToolState } from "../../lib/tool.ts";
import {
    getElementConfig,
    getElementsSnappingEdges,
    getElementSnappingPoints,
    getElementsBoundingRectangle,
} from "../../lib/elements.js";

import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectDraggingState extends ToolState {
    private dragged: boolean = false;
    private elementPrevSelected: boolean = false;
    private snapshot: any[] = [];
    private snapshotBounds: any[] = [];
    private snapEdges: any[] = [];
    private activeSnapEdges: any[] = [];

    private getSnappedCoordinate(value: number, edge: string, size: number, includeCenter: boolean): number {
        return getSnappedCoordinate(value, !!this.editor.appState?.grid, !!this.editor.appState?.snapToElements, this.snapEdges, this.activeSnapEdges, edge, size, includeCenter);
    }

    onEnter(params: any) {
        const selectedElements = this.editor.getSelection();
        const notSelectedElements = this.editor.getElements().filter((element: any) => {
            return !element.selected;
        });

        this.dragged = false;
        this.elementPrevSelected = params.elementPrevSelected;
        this.snapshot = selectedElements.map((element: any) => Object.assign({}, element));
        this.snapshotBounds = getElementsBoundingRectangle(selectedElements);
        this.snapEdges = this.editor?.appState?.snapToElements ? getElementsSnappingEdges(notSelectedElements) : [];
        this.activeSnapEdges = [];

        // reset visible snaps
        this.editor.setSnaps([]);
    }

    onPointerMove(event: EditorPointEvent) {
        this.dragged = true;
        this.activeSnapEdges = []; // reset active snap edges
        const selectedElements = this.editor.getSelection();

        const includeCenter = selectedElements.length > 1 || selectedElements[0].type !== ELEMENTS.ARROW;
        const width = this.snapshotBounds[1][0] - this.snapshotBounds[0][0];
        const height = this.snapshotBounds[1][1] - this.snapshotBounds[0][1];
        const dx = this.getSnappedCoordinate(this.snapshotBounds[0][0] + event.dx, SNAP_EDGE_X, width, includeCenter) - this.snapshotBounds[0][0];
        const dy = this.getSnappedCoordinate(this.snapshotBounds[0][1] + event.dy, SNAP_EDGE_Y, height, includeCenter) - this.snapshotBounds[0][1];

        // move selected elements
        selectedElements.forEach((element: any, index: number) => {
            const originalElement = this.snapshot[index];
            element.x1 = originalElement.x1 + dx;
            element.y1 = originalElement.y1 + dy;
            element.x2 = originalElement.x2 + dx;
            element.y2 = originalElement.y2 + dy;
            getElementConfig(element).onDrag?.(element, originalElement, null);
        });

        // manipulate visible snaps
        this.editor.setSnaps([]);
        if (this.editor?.appState?.snapToElements && this.activeSnapEdges.length > 0) {
            let boundElement = selectedElements[0];
            if (selectedElements.length > 1) {
                const bounds = getElementsBoundingRectangle(selectedElements);
                boundElement = {
                    x1: bounds[0][0],
                    y1: bounds[0][1],
                    x2: bounds[1][0],
                    y2: bounds[1][1],
                };
            }
            this.editor.setSnaps(this.activeSnapEdges.map(snapEdge => {
                return Object.assign({}, snapEdge, {
                    points: [
                        ...snapEdge.points,
                        ...(getElementSnappingPoints(boundElement, snapEdge) || []),
                    ],
                });
            }));
        }
    }

    onPointerUp(event: EditorPointEvent) {
        const selectedElements = this.editor.getSelection();

        if (!this.dragged) {
            const target = event.nativeEvent?.target as HTMLElement | undefined;
            const elementId = target?.dataset?.element;
            if (elementId) {
                const element = this.editor.getElement(elementId);
                // check if the shift key is pressed. If not, clear the selection and select the element.
                // If the shift key is pressed, toggle the selection of the element.
                if (!event.shiftKey) {
                    this.editor.clearSelection();
                    element.selected = true;
                }
                else {
                    element.selected = !this.elementPrevSelected;
                }
                // select all elements of this group
                if (element.group && !this.editor.page.activeGroup) {
                    this.editor.getElements().forEach((el: any) => {
                        el.selected = el.group === element.group ? element.selected : el.selected;
                    });
                }
            }
        }

        if (this.dragged) {
            // 1. increment the version of each element in the selection
            selectedElements.forEach((element: any) => {
                element[FIELDS.VERSION] = element[FIELDS.VERSION] + 1;
            });
            // 2. register the history change
            this.editor.addHistory({
                type: CHANGES.UPDATE,
                elements: selectedElements.map((element: any, index: number) => {
                    const updatedFields = new Set(["x1", "x2", "y1", "y2", "rotation", "version"]);
                    // We need to check the fields that the element has updated internally
                    const elementConfig = getElementConfig(element);
                    if (typeof elementConfig.getUpdatedFields === "function") {
                        (elementConfig.getUpdatedFields(element, this.snapshot[index]) || []).forEach(key => {
                            updatedFields.add(key);
                        });
                    }
                    // Generate list of fields to update
                    const keys = Array.from(updatedFields);
                    return {
                        id: element.id,
                        prevValues: Object.fromEntries(keys.map(key => [key, this.snapshot[index][key]])),
                        newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                    };
                }),
            });
            // 3. dispatch the change
            this.editor.dispatchChange();
        }

        this.dragged = false;
        this.elementPrevSelected = false;
        this.snapshot = [];
        this.snapEdges = [];
        this.activeSnapEdges = [];

        // switch to idle state
        this.parent?.transition("idle");
        this.editor.setSnaps([]); // reset visible snaps
        this.editor.update();
    }
};
