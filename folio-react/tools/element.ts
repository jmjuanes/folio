import { ELEMENTS, CHANGES, TOOLS, FIELDS } from "../constants.js";
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
        this.element = this.editor.createElement(this.elementType);
        const config = getElementConfig(this.element);
        const editorDefaults = this.editor.getDefaults();
        Object.assign(this.element, {
            ...(config?.initialize?.(editorDefaults) || {}),
            x1: event.originalX,
            y1: event.originalY,
            x2: event.originalX,
            y2: event.originalY,
            creating: true,
        });
        // 2. call creation hooks
        if (typeof config?.onCreateStart === "function") {
            config.onCreateStart(this.element, event);
        }
        // 3. update the editor state
        this.editor.clearSelection();
        this.editor.addElements([this.element]);
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
            this.element.selected = true; // By default select this element
            this.element[FIELDS.VERSION] = 1; // Set as initial version of this element
            // 2. call onCreateEnd if this element has this callback
            const config = getElementConfig(this.element);
            if (typeof config.onCreateEnd === "function") {
                config.onCreateEnd(this.element, event);
            }
            // 3. we need to patch the history to save the new element values
            const last = this.editor.page.history[0] || {};
            if (last.type === CHANGES.CREATE && last.elements?.[0]?.id === this.element.id) {
                last.elements[0].newValues = {
                    ...this.element,
                    selected: false,
                };
            }
            // 4. clear the element reference and dispatch change
            this.editor.dispatchChange();
            // 5.1. if the tool is not locked, switch to select tool
            // check also if the tool is not the handdraw
            if (!this.editor.toolLocked && this.elementType !== ELEMENTS.DRAW) {
                const toolChangeParams: any = {};
                // terrible hack to enable editing in a text element
                if (this.element.type === ELEMENTS.TEXT) {
                    this.element.editing = true;
                    toolChangeParams.activeElement = this.element;
                }
                this.editor.setCurrentTool(TOOLS.SELECT, toolChangeParams);
            }
            // 5.2. if tool is locked, we need to reset the current selection
            else {
                this.element.selected = false;
                this.element = null;
            }
            // this.editor.update();
        }
    }
};
