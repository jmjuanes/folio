import {
    ELEMENTS,
    GRID_SIZE,
    CHANGES,
    KEYS,
} from "../../constants.js";
import { isArrowKey } from "../../utils/keys.js";
import { isInputTarget } from "../../utils/events.js";
import { getElementConfig } from "../../lib/elements.js";
import { ToolState } from "../../lib/tool.ts";
import { removeTextElement, getSnappedCoordinate } from "../utils/element.ts";

import type { EditorKeyboardEvent } from "../../lib/events.ts";
import type { EditorPointEvent } from "../../lib/events.ts";

export class SelectIdleState extends ToolState {
    private activeElement: any | null = null;

    private getSnappedCoordinate(value: number): number {
        return getSnappedCoordinate(value, !!this.editor.appState?.grid);
    }

    onEnter(params: any = {}) {
        debugger;
        this.activeElement = params?.activeElement || null;
    }

    onExit() {
        this.activeElement = null;
    }

    onPointerDown(event: EditorPointEvent) {
        this.parent?.transition("pointing", event);
    }

    onKeyDown(event: EditorKeyboardEvent): boolean | void {
        // on readonly key-down listening is disabled
        if (this.editor.page.readonly) {
            return false;
        }

        // if we are in input target, we only handle escape key (for example to exit text editing)
        if (isInputTarget(event.nativeEvent)) {
            if (this.activeElement?.editing && event.key === KEYS.ESCAPE) {
                event.nativeEvent.preventDefault();
                this.activeElement.editing = false;
                if (this.activeElement.type === ELEMENTS.TEXT && !this.activeElement.text) {
                    removeTextElement(this.editor, this.activeElement);
                }
                this.editor.dispatchChange();
                this.editor.update();
                this.activeElement = null;
                return true;
            }
        }
        // handle escape key for 
        else if (event.key === KEYS.ESCAPE) {
            if (this.editor.page.activeGroup) {
                this.editor.page.activeGroup = null;
            }
            event.nativeEvent.preventDefault();
            this.editor.clearSelection();
            return true;
        }
        else if (!event.ctrlKey && isArrowKey(event.key)) {
            event.nativeEvent.preventDefault();
            const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
            const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
            const selectedElements = this.editor.getSelection();
            if (selectedElements.length === 0) {
                return false;
            }
            this.editor.addHistory({
                type: CHANGES.UPDATE,
                elements: selectedElements.map((element: any) => {
                    const snapshot: any = Object.assign({}, element);
                    const elementConfig = getElementConfig(element);
                    const field1 = `${dir}1`, field2 = `${dir}2`;
                    const fields = [field1, field2];
                    if (typeof elementConfig.getUpdatedFields === "function") {
                        (elementConfig.getUpdatedFields(element) || []).forEach((f: string) => fields.push(f));
                    }
                    // update element positions
                    Object.assign(element, {
                        [field1]: event.shiftKey ? snapshot[field1] + sign : this.getSnappedCoordinate(snapshot[field1] + sign * GRID_SIZE),
                        [field2]: event.shiftKey ? snapshot[field2] + sign : this.getSnappedCoordinate(snapshot[field2] + sign * GRID_SIZE),
                    });
                    elementConfig.onDrag?.(element, snapshot, null);
                    return {
                        id: element.id,
                        prevValues: Object.fromEntries(fields.map(field => [field, snapshot[field]])),
                        newValues: Object.fromEntries(fields.map(field => [field, element[field]])),
                    };
                }),
            });
            this.editor.dispatchChange();
            return true;
        }
        return false;
    }
};
