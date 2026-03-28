import { ELEMENTS, CHANGES, TOOLS } from "../constants.js";
import { getElementConfig } from "../lib/elements.js";
import { ToolState } from "../lib/tool.ts";
import type { EditorPointEvent } from "../lib/events.ts";

export class ElementTool extends ToolState {
    id = TOOLS.ELEMENT;
    private element: any | null = null;
    private elementType: string = "";

    onEnter(params: any) {
        this.element = null;
        this.elementType = params.type;
    }

    onExit() {
        this.element = null;
        this.elementType = "";
    }

    onPointerDown(event: EditorPointEvent) {
        // 1. create the new element
        this.element = Object.assign(this.editor.createElement(this.elementType), {
            x1: event.originalX,
            y1: event.originalY,
            x2: event.originalX,
            y2: event.originalY,
            creating: true,
        });
        // 2. call onCreateStart if this element has this callback
        const config = getElementConfig(this.element);
        if (typeof config.onCreateStart === "function") {
            config.onCreateStart(this.element, event);
        }
        // 3. update the editor state
        this.editor.clearSelection();
        this.editor.addElements([this.element]);
        this.editor.setSelection([this.element.id]);
    }

    onPointerMove(event: EditorPointEvent) {
        if (this.element?.creating) {
            // 1. update the element position
            this.element.x2 = event.currentX;
            this.element.y2 = event.currentY;
            // 2. call onCreateMove if this element has this callback
            const config = getElementConfig(this.element);
            if (typeof config.onCreateMove === "function") {
                config.onCreateMove(this.element, event, (pos: number) => pos);
            }
        }
    }

    onPointerUp(event: EditorPointEvent) {
        if (this.element?.creating) {
            // 1. mark the element as not creating
            this.element.creating = false;
            // 2. call onCreateEnd if this element has this callback
            const config = getElementConfig(this.element);
            if (typeof config.onCreateEnd === "function") {
                config.onCreateEnd(this.element, event);
            }
            // 3. add the element to the history
            this.editor.addHistory({
                type: CHANGES.CREATE,
                elements: [this.element],
            });
            // 4. clear the element reference and dispatch change
            this.element = null;
            this.editor.dispatchChange();
            // 5. if the tool is not locked, switch to select tool
            if (!this.editor.toolLocked) {
                this.editor.setCurrentTool(TOOLS.SELECT);
            }
        }
    }
};
