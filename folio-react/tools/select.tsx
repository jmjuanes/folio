import React from "react";
import {
    ELEMENTS,
    TOOLS,
    HANDLERS,
    GRID_SIZE,
    IS_DARWIN,
    CHANGES,
    KEYS,
    STATUS,
    SNAP_THRESHOLD,
    SNAP_EDGE_X,
    SNAP_EDGE_Y,
    FIELDS,
} from "../constants.js";
import {
    clampAngle,
    snapAngle,
    rotatePoints,
    getRectangle,
    getPointProjectionToLine,
    getCenter,
} from "../utils/math.ts";
import { isArrowKey } from "../utils/keys.js";
import { isInputTarget } from "../utils/events.js";
import {
    getElementConfig,
    getElementsSnappingEdges,
    getElementSnappingPoints,
    getElementsBoundingRectangle,
    getElementSize,
    getElementMinimumSize,
} from "../lib/elements.js";
import {
    isCornerHandler,
    isEdgeHandler,
    isNodeHandler,
    computeResizeDelta,
    clampCornerResizeToMinSize,
    clampEdgeResizeToMinSize,
} from "../lib/handlers.ts";
import { BaseTool, StateNode } from "./base.tsx";
import type { Point } from "../utils/math.ts";
import type { CanvasEvent } from "../components/canvas.tsx";

// @private remove the current text element
const removeTextElement = (editor: any, element: any) => {
    const history = editor.getHistory();
    if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
        history.shift();
    }
    editor.removeElements([element]);
    editor.dispatchChange();
};

class SelectIdle extends StateNode {
    onPointerDown(event: CanvasEvent) {
        this.parent?.transition("pointing", event);
    }
}

class SelectPointing extends StateNode {
    onEnter(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;

        if (handler) {
            parent.snapshot = this.editor.getSelection().map((el: any) => ({ ...el }));
            parent.snapshotBounds = getElementsBoundingRectangle(this.editor.getSelection());
            parent.snapEdges = getElementsSnappingEdges(this.editor.getElements().filter((el: any) => !el.selected));
            return this.parent?.transition("resizing", { handler });
        }
        
        const elementId = target?.dataset?.element;
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

        if (!event.shiftKey) {
            this.editor.clearSelection();
        }
        this.parent?.transition("brushing", event);
    }

    onPointerUp(event: CanvasEvent) {
        this.parent?.transition("idle");
    }
}

class SelectDragging extends StateNode {
    onEnter(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
        parent.snapshot = this.editor.getSelection().map((el: any) => ({ ...el }));
        parent.snapEdges = getElementsSnappingEdges(this.editor.getElements().filter((el: any) => !el.selected));
    }

    onPointerMove(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
        const selectedElements = this.editor.getSelection();
        parent.activeSnapEdges = [];

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

    onPointerUp(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
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
        this.parent?.transition("idle");
    }
}

class SelectResizing extends StateNode {
    private handler: string = "";

    onEnter(info: any) {
        this.handler = info.handler;
    }

    onPointerMove(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
        const selectedElements = this.editor.getSelection();
        parent.activeSnapEdges = [];

        const info = {
            handler: this.handler,
            dx: event.dx || 0,
            dy: event.dy || 0,
            shiftKey: event.shiftKey,
        };

        selectedElements.forEach((element: any, index: number) => {
            const snap = parent.snapshot[index];
            const config = getElementConfig(element);
            if (typeof config.onResize === "function") {
                config.onResize(element, snap, info, parent.getPosition.bind(parent));
            }
        });
    }

    onPointerUp(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
        const selectedElements = this.editor.getSelection();
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
        this.parent?.transition("idle");
    }
}

class SelectRotating extends StateNode {
    onPointerMove(event: CanvasEvent) {
        this.handleMove(event);
    }

    handleMove(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
        const element = this.editor.getElement(parent.snapshot[0].id);
        const cx = (parent.snapshot[0].x1 + parent.snapshot[0].x2) / 2;
        const cy = (parent.snapshot[0].y1 + parent.snapshot[0].y2) / 2;
        const prevAngle = Math.atan2(event.originalY - cy, event.originalX - cx) + Math.PI / 2;
        const currentAngle = Math.atan2((event.currentY ?? cy) - cy, (event.currentX ?? cx) - cx) + Math.PI / 2;
        const deltaAngle = clampAngle(event.shiftKey ? snapAngle(currentAngle - prevAngle) : currentAngle - prevAngle);
        element.rotation = clampAngle((parent.snapshot[0].rotation || 0) + deltaAngle);
        const newPoints = rotatePoints([[parent.snapshot[0].x1, parent.snapshot[0].y1], [parent.snapshot[0].x2, parent.snapshot[0].y2]], [cx, cy], deltaAngle);
        element.x1 = newPoints[0][0]; element.y1 = newPoints[0][1]; element.x2 = newPoints[1][0]; element.y2 = newPoints[1][1];
    }

    onPointerUp(event: CanvasEvent) {
        const parent = this.parent as unknown as SelectTool;
        const selectedElements = this.editor.getSelection();
        selectedElements.forEach((el: any) => el[FIELDS.VERSION] = el[FIELDS.VERSION] + 1);

        this.editor.addHistory({
            type: CHANGES.UPDATE,
            elements: selectedElements.map((element: any, index: number) => {
                const keys = ["x1", "x2", "y1", "y2", "rotation", "version"];
                return {
                    id: element.id,
                    prevValues: Object.fromEntries(keys.map(k => [k, parent.snapshot[index][k]])),
                    newValues: Object.fromEntries(keys.map(k => [k, element[k]])),
                };
            }),
        });
        this.editor.dispatchChange();
        this.parent?.transition("idle");
    }
}

class SelectBrushing extends StateNode {
    onEnter(event: CanvasEvent) {
        this.editor.state.selection = { x1: event.originalX, y1: event.originalY, x2: event.originalX, y2: event.originalY };
    }

    onPointerMove(event: CanvasEvent) {
        this.editor.state.selection.x2 = event.currentX;
        this.editor.state.selection.y2 = event.currentY;
    }

    onPointerUp(event: CanvasEvent) {
        const selection = this.editor.state.selection;
        this.editor.setSelectionArea({
            x1: Math.min(selection.x1, selection.x2),
            x2: Math.max(selection.x1, selection.x2),
            y1: Math.min(selection.y1, selection.y2),
            y2: Math.max(selection.y1, selection.y2),
        });
        this.editor.state.selection = null;
        this.parent?.transition("idle");
    }
}

export class SelectTool extends BaseTool {
    static id = TOOLS.SELECT;
    id = TOOLS.SELECT;
    name = "Select";
    icon = "pointer";
    default = true;
    primary = true;
    shortcut = "v";

    // Shared state for sub-states
    public snapshot: any[] = [];
    public snapshotBounds: any = null;
    public snapEdges: any[] = [];
    public activeSnapEdges: any[] = [];
    public activeElement: any = null;
    public isPrevSelected = false;

    children = {
        idle: SelectIdle,
        pointing: SelectPointing,
        dragging: SelectDragging,
        resizing: SelectResizing,
        rotating: SelectRotating,
        brushing: SelectBrushing,
    };

    onEnter() {
        this.snapshot = [];
        this.snapshotBounds = null;
        this.snapEdges = [];
        this.activeSnapEdges = [];
        this.isPrevSelected = false;
        this.transition("idle");
    }

    public getPosition(pos: number, edge: string | null = null, size: number = 0, includeCenter: boolean = false): number {
        if (this.editor.appState?.grid) {
            return Math.round(pos / GRID_SIZE) * GRID_SIZE;
        }
        if (edge && this.editor.appState?.snapToElements) {
            const edges = size > 0 ? (includeCenter ? [0, size / 2, size] : [0, size]) : [0];
            for (let i = 0; i < this.snapEdges.length; i++) {
                const item = this.snapEdges[i];
                if (item.edge === edge && typeof item[edge] !== "undefined") {
                    for (let j = 0; j < edges.length; j++) {
                        if (Math.abs(item[edge] - pos - edges[j]) < SNAP_THRESHOLD) {
                            this.activeSnapEdges.push(item);
                            return item[edge] - edges[j];
                        }
                    }
                }
            }
        }
        return pos;
    }

    onKeyDown(event: KeyboardEvent): boolean | void {
        if (this.editor.page.readonly) return;
        
        const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
        if (isInputTarget(event)) {
            if (this.activeElement?.editing && event.key === KEYS.ESCAPE) {
                event.preventDefault();
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
            event.preventDefault();
            this.editor.clearSelection();
            return true;
        }
        else if (!isCtrlKey && isArrowKey(event.key)) {
            event.preventDefault();
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
                    el[field1] = event.shiftKey ? snap[field1] + sign : this.getPosition(snap[field1] + sign * GRID_SIZE);
                    el[field2] = event.shiftKey ? snap[field2] + sign : this.getPosition(snap[field2] + sign * GRID_SIZE);
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
}
