import { FIELDS, CHANGES } from "../../constants.js";
import { ToolState } from "../../lib/tool.ts";
import {
    getElementConfig,
    getElementsSnappingEdges,
} from "../../lib/elements.js";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectDraggingState extends ToolState {
    onEnter() {
        const parent = this.parent as any;
        const notSelectedElements = this.editor.getElements().filter((element: any) => {
            return !element.selected;
        });
        parent.snapEdges = getElementsSnappingEdges(notSelectedElements);
        parent.snapshot = this.editor.getSelection().map((element: any) => {
            return Object.assign({}, element);
        });
    }

    onPointerMove(event: EditorPointEvent) {
        const parent = this.parent as any;
        const selectedElements = this.editor.getSelection();
        parent.activeSnapEdges = []; // reset active snap edges

        const dx = parent.getPosition(event.dx || 0);
        const dy = parent.getPosition(event.dy || 0);

        selectedElements.forEach((element: any, index: number) => {
            const snap = parent.snapshot[index];
            element.x1 = snap.x1 + dx;
            element.y1 = snap.y1 + dy;
            element.x2 = snap.x2 + dx;
            element.y2 = snap.y2 + dy;
            getElementConfig(element).onDrag?.(element, snap, null);
        });
    }

    onPointerUp(event: EditorPointEvent) {
        const parent = this.parent as any;
        const selectedElements = this.editor.getSelection();

        if (!event.drag && parent.isPrevSelected && event.shiftKey) {
            const target = event.originalEvent?.target as HTMLElement | undefined;
            const elementId = target?.dataset?.element;
            if (elementId) {
                const element = this.editor.getElement(elementId);
                if (element) this.editor.deselectElements([element]);
            }
        }

        if (event.drag) {
            selectedElements.forEach((el: any) => el[FIELDS.VERSION] = el[FIELDS.VERSION] + 1);
            this.editor.addHistory({
                type: CHANGES.UPDATE,
                elements: selectedElements.map((element: any, index: number) => ({
                    id: element.id,
                    prevValues: parent.snapshot[index],
                    newValues: { ...element },
                })),
            });
            this.editor.dispatchChange();
        }

        // switch to idle state
        this.parent?.transition("idle");
    }
};
