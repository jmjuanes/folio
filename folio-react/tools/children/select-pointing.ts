import { ToolState } from "../../lib/tool.ts";
import type { EditorPointEvent } from "../../lib/events.ts";
import { isRotationHandler } from "../../lib/handlers.ts";

export class SelectPointingState extends ToolState {
    onEnter(event: EditorPointEvent) {
        const target = event.nativeEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;
        const elementId = target?.dataset?.element;

        // 1. check if a handler or element has been pointed
        if (handler) {
            const state = isRotationHandler(handler) ? "rotating" : "resizing";
            return this.parent?.transition(state, {
                event: event,
                handler: handler,
            });
        }

        // 2. check if an element has been pointed
        if (elementId) {
            const element = this.editor.getElement(elementId);
            const elementPrevSelected = !!element?.selected;
            // check to reset active group
            if (this.editor.page.activeGroup && element.group !== this.editor.page.activeGroup) {
                this.editor.getElements().forEach((el: any) => {
                    el.selected = el.group === this.editor.page.activeGroup || el.selected;
                });
                this.editor.page.activeGroup = null;
            }
            const inCurrentSelection = this.editor.getSelection().some((el: any) => {
                return el.id === element.id;
            });
            if (!inCurrentSelection && !event.shiftKey) {
                this.editor.clearSelection();
            }
            element.selected = true;
            if (!this.editor.page.activeGroup && element.group) {
                this.editor.getElements().forEach((el: any) => {
                    el.selected = el.selected || (el.group && el.group === element.group);
                });
            }
            this.editor.update();
            return this.parent?.transition("dragging", {
                event: event,
                elementId: elementId,
                elementPrevSelected: elementPrevSelected,
            });
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
