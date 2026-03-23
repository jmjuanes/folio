import { FIELDS, CHANGES } from "../../constants.js";
import { ToolNode } from "../../lib/tool.ts";
import { getElementConfig } from "../../lib/elements.js";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectResizingTool extends ToolNode {
    private handler: string = "";

    onEnter(event: any) {
        // when entering in this subtool, save the handler
        this.handler = event.handler;
    }

    onPointerMove(event: EditorPointEvent) {
        const parent = this.parent as any;
        const selectedElements = this.editor.getSelection();
        parent.activeSnapEdges = [];

        const info: any = {
            handler: this.handler,
            dx: event.dx || 0,
            dy: event.dy || 0,
            shiftKey: event.shiftKey,
        };

        selectedElements.forEach((element: any, index: number) => {
            const snapshot = parent.snapshot[index];
            const config = getElementConfig(element);
            if (typeof config.onResize === "function") {
                config.onResize(element, snapshot, info, parent.getPosition.bind(parent));
            }
        });
    }

    onPointerUp() {
        const parent = this.parent as any;
        const selectedElements = this.editor.getSelection();

        // update version in all elements of the selection
        selectedElements.forEach((element: any) => {
            element[FIELDS.VERSION] = element[FIELDS.VERSION] + 1;
        });

        this.editor.addHistory({
            type: CHANGES.UPDATE,
            elements: selectedElements.map((element: any, index: number) => ({
                id: element.id,
                prevValues: parent.snapshot[index],
                newValues: { ...element },
            })),
        });
        this.editor.dispatchChange();
        this.parent?.transition("idle");
    }
}

