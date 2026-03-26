import {
    ELEMENTS,
    TOOLS,
    GRID_SIZE,
    CHANGES,
    KEYS,
} from "../constants.js";
import { isArrowKey } from "../utils/keys.js";
import { isInputTarget } from "../utils/events.js";
import { getElementConfig } from "../lib/elements.js";
import { ToolState } from "../lib/tool.ts";
import { removeTextElement, getSnappedCoordinate } from "./utils/element.ts";

import { SelectDraggingState } from "./children/select-dragging.ts";
import { SelectBrushingState } from "./children/select-brushing.ts";
import { SelectIdleState } from "./children/select-idle.ts";
import { SelectPointingState } from "./children/select-pointing.ts";
import { SelectResizingState } from "./children/select-resizing.ts";
import { SelectRotatingState } from "./children/select-rotating.ts";

import type { EditorKeyboardEvent } from "../lib/events.ts";

export class SelectTool extends ToolState {
    id = TOOLS.SELECT;

    // shared state for sub-states
    public snapshot: any[] = [];
    public snapshotBounds: any = null;
    public snapEdges: any[] = [];
    public activeSnapEdges: any[] = [];
    public activeElement: any = null;

    children = {
        "idle": SelectIdleState,
        "pointing": SelectPointingState,
        "dragging": SelectDraggingState,
        "resizing": SelectResizingState,
        "rotating": SelectRotatingState,
        "brushing": SelectBrushingState,
    };

    onEnter() {
        this.snapshot = [];
        this.snapshotBounds = null;
        this.snapEdges = [];
        this.activeSnapEdges = [];
        this.transition("idle");
    }

    private getSnappedCoordinate(value: number): number {
        return getSnappedCoordinate(value, !!this.editor.appState?.grid);
    }

    onKeyDown(event: EditorKeyboardEvent): boolean | void {
        // on readonly key-down listening is disabled
        if (this.editor.page.readonly) {
            return;
        }

        // TODO: move this logic to canvas
        // const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
        if (isInputTarget(event)) {
            if (this.activeElement?.editing && event.key === KEYS.ESCAPE) {
                event.nativeEvent.preventDefault();
                this.activeElement.editing = false;
                if (this.activeElement.type === ELEMENTS.TEXT && !this.activeElement.text) {
                    removeTextElement(this.editor, this.activeElement);
                }
                this.activeElement = null;
                return true;
            }
        }
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
            if (selectedElements.length === 0) return;

            this.editor.addHistory({
                type: CHANGES.UPDATE,
                elements: selectedElements.map((el: any) => {
                    const snap = { ...el };
                    const elementConfig = getElementConfig(el);
                    const field1 = `${dir}1`, field2 = `${dir}2`;
                    const fields = [field1, field2];
                    if (typeof elementConfig.getUpdatedFields === "function") {
                        (elementConfig.getUpdatedFields(el) || []).forEach((f: string) => fields.push(f));
                    }
                    el[field1] = event.shiftKey ? snap[field1] + sign : this.getSnappedCoordinate(snap[field1] + sign * GRID_SIZE);
                    el[field2] = event.shiftKey ? snap[field2] + sign : this.getSnappedCoordinate(snap[field2] + sign * GRID_SIZE);
                    elementConfig.onDrag?.(el, snap, null);
                    return {
                        id: el.id,
                        prevValues: Object.fromEntries(fields.map(f => [f, snap[f]])),
                        newValues: Object.fromEntries(fields.map(f => [f, el[f]])),
                    };
                }),
            });
            this.editor.dispatchChange();
            return true;
        }
    }
};
