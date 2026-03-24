import { ToolState } from "../../lib/tool.ts";
import {
    getElementsSnappingEdges,
    getElementsBoundingRectangle,
} from "../../lib/elements.js";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectPointingState extends ToolState {
    onEnter(event: EditorPointEvent) {
        const parent = this.parent as any;
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;
        const elementId = target?.dataset?.element;

        // 1. check if a handler has been pointed
        if (handler) {
            const selectedElements = this.editor.getSelection();
            const notSelectedElements = this.editor.getElements().filter((element: any) => {
                return !element.selected;
            });
            parent.snapshot = selectedElements.map((element: any) => Object.assign({}, element));
            parent.snapshotBounds = getElementsBoundingRectangle(selectedElements);
            parent.snapEdges = getElementsSnappingEdges(notSelectedElements);
            return this.parent?.transition("resizing", { handler });
        }

        // 2. check if an element has been pointed
        if (elementId) {
            const element = this.editor.getElement(elementId);
            if (element && !element.selected) {
                if (!event.shiftKey) {
                    this.editor.clearSelection();
                }
                this.editor.selectElements([element]);
            }
            parent.isPrevSelected = !!element?.selected;
            return this.parent?.transition("dragging", event);
        }

        // 3. in other case, clear selecting if the shift key is not pressed and start
        // the brushing state to select elements
        if (!event.shiftKey) {
            this.editor.clearSelection();
        }
        this.parent?.transition("brushing", event);
    }

    onPointerUp() {
        this.parent?.transition("idle");
    }
};
