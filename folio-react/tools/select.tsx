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
import { Handlers } from "./children/handlers.tsx";
import { BaseTool } from "./base.tsx";
import { SnapEdges } from "./children/snaps.tsx";
import { Dimensions } from "./children/dimensions.tsx";
import { Bounds } from "./children/bounds.tsx";
import { Brush } from "./children/brush.tsx";
import type { Point } from "../utils/math.ts";
import type { ToolEventParams, ToolRenderingParams } from "./base.tsx";
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

export class SelectTool extends BaseTool {
    private selection: any[] | null = [];
    private snapshot: any[] = [];
    private snapshotBounds: any = null;
    private snapEdges: any[] = [];
    private activeSnapEdges: any[] = [];
    private activeElement: any = null;
    private isDragged = false;
    private isResized = false;
    private isPrevSelected = false;

    id = TOOLS.SELECT;
    name = "Select";
    icon = "pointer";
    primary = true;
    shortcut = "v";

    onEnter() {
        this.selection = null;
        this.snapshot = [];
        this.snapshotBounds = null;
        this.snapEdges = [];
        this.activeSnapEdges = [];
        this.isDragged = false;
        this.isResized = false;
        this.isPrevSelected = false;
    }

    private handlePointCanvas(editor: any, event: CanvasEvent) {
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;
        const elementId = target?.dataset?.element;

        if (handler || elementId) {
            return;
        }
        editor.state.snapEdges = [];
        if (this.activeElement) {
            if (this.activeElement?.editing) {
                if (this.activeElement.type === ELEMENTS.TEXT && !this.activeElement.text) {
                    removeTextElement(editor, this.activeElement);
                }
            }
            this.activeElement.editing = false;
            this.activeElement = null;
        }
        // Check if we have an active group
        if (editor.page.activeGroup) {
            editor.page.activeGroup = null;
        }
        editor.clearSelection();
    }

    private handlePointElement(editor: any, event: CanvasEvent) {
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;
        const elementId = target?.dataset?.element;

        const element = editor.getElement(elementId);
        this.isPrevSelected = element.selected;
        // Check to reset active group
        if (editor.page.activeGroup && element.group !== editor.page.activeGroup) {
            editor.getElements().forEach((el: any) => {
                el.selected = el.group === editor.page.activeGroup || el.selected;
            });
            editor.page.activeGroup = null;
        }
        const inCurrentSelection = editor.getSelection().some((el: any) => {
            return el.id === element.id;
        });
        if (!inCurrentSelection && !event.shiftKey) {
            editor.clearSelection();
        }
        element.selected = true;
        if (!editor.page.activeGroup && element.group) {
            editor.getElements().forEach((el: any) => {
                el.selected = el.selected || (el.group && el.group === element.group);
            });
        }
    }

    onPointerDown({ editor, event }: ToolEventParams) {
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;
        const elementId = target?.dataset?.element;

        if (!handler && !elementId) {
            this.handlePointCanvas(editor, event);
        }
        else if (!handler && elementId) {
            this.handlePointElement(editor, event);
        }

        this.isDragged = false;
        this.isResized = false;
        this.snapshot = [];
        const selectedElements = editor.getSelection();

        // First check if we are in an edit action
        if (this.activeElement?.editing) {
            if (this.activeElement.type === ELEMENTS.TEXT && !this.activeElement.text) {
                removeTextElement(editor, this.activeElement);
            }
            this.activeElement = null;
        }

        // Check if we have selected elements
        if (selectedElements.length > 0) {
            if (!selectedElements.some((el: any) => el.locked)) {
                this.snapshot = editor.getSelection().map((el: any) => ({ ...el }));
                this.snapshotBounds = getElementsBoundingRectangle(this.snapshot);
                // Check for calling the onResizeStart listener
                if (handler && this.snapshot.length === 1) {
                    const element = editor.getElement(this.snapshot[0].id);
                    const elementConfig = getElementConfig(element);
                    if (typeof elementConfig.onResizeStart === "function") {
                        elementConfig.onResizeStart(element, this.snapshot[0], event);
                    }
                }
            }
        }
        // No selected elements → start brush selection
        else {
            editor.state.selection = {
                x1: event.originalX,
                y1: event.originalY,
                x2: event.originalX,
                y2: event.originalY,
            };
        }

        editor.state.snapEdges = [];
        this.snapEdges = [];
        this.activeSnapEdges = [];
        if (selectedElements.length > 0) {
            if (editor?.appState?.snapToElements) {
                this.snapEdges = getElementsSnappingEdges(editor.getElements());
            }
        }
    }

    private getPosition(editor: any, pos: number, edge: string | null = null, size: number = 0, includeCenter: boolean = false): number {
        // 1. Check if grid mode is enabled
        if (editor?.appState?.grid) {
            return Math.round(pos / GRID_SIZE) * GRID_SIZE;
        }
        // 2. check if snap mode is enabled
        if (edge && editor?.appState?.snapToElements) {
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
        // 3: just return the new position
        return pos;
    }

    private handleTranslateMove(editor: any, event: CanvasEvent) {
        editor.state.snapEdges = [];
        this.activeSnapEdges = [];
        editor.state.status = STATUS.TRANSLATING;
        this.isDragged = true;
        const elements = editor.getSelection();
        const includeCenter = elements.length > 1 || elements[0].type !== ELEMENTS.ARROW;
        const dx = this.getPosition(editor, this.snapshotBounds[0][0] + ((event.dx || 0) || 0), SNAP_EDGE_X, this.snapshotBounds[1][0] - this.snapshotBounds[0][0], includeCenter) - this.snapshotBounds[0][0];
        const dy = this.getPosition(editor, this.snapshotBounds[0][1] + ((event.dy || 0) || 0), SNAP_EDGE_Y, this.snapshotBounds[1][1] - this.snapshotBounds[0][1], includeCenter) - this.snapshotBounds[0][1];
        elements.forEach((element: any, index: number) => {
            element.x1 = this.snapshot[index].x1 + dx;
            element.x2 = this.snapshot[index].x2 + dx;
            element.y1 = this.snapshot[index].y1 + dy;
            element.y2 = this.snapshot[index].y2 + dy;
            getElementConfig(element)?.onDrag?.(element, this.snapshot[index], event);
        });
        if (editor?.appState?.snapToElements && this.activeSnapEdges.length > 0) {
            let boundElement = elements[0];
            if (elements.length > 1) {
                const bounds = getElementsBoundingRectangle(elements);
                boundElement = {
                    x1: bounds[0][0],
                    y1: bounds[0][1],
                    x2: bounds[1][0],
                    y2: bounds[1][1],
                };
            }
            editor.state.snapEdges = this.activeSnapEdges.map((snapEdge: any) => ({
                points: [
                    ...snapEdge.points,
                    ...(getElementSnappingPoints(boundElement, snapEdge) || []),
                ],
            }));
        }
    }

    private handleRotationMove(editor: any, event: CanvasEvent, element: any) {
        const cx = (this.snapshot[0].x1 + this.snapshot[0].x2) / 2;
        const cy = (this.snapshot[0].y1 + this.snapshot[0].y2) / 2;
        const prevAngle = Math.atan2(event.originalY - cy, event.originalX - cx) + Math.PI / 2;
        const currentAngle = Math.atan2((event.currentY ?? cy) - cy, (event.currentX ?? cx) - cx) + Math.PI / 2;
        const deltaAngle = clampAngle(event.shiftKey ? snapAngle(currentAngle - prevAngle) : currentAngle - prevAngle);
        const angle = clampAngle((this.snapshot[0].rotation || 0) + deltaAngle);
        element.rotation = angle;
        const newPoints = rotatePoints([[this.snapshot[0].x1, this.snapshot[0].y1], [this.snapshot[0].x2, this.snapshot[0].y2]], [cx, cy], deltaAngle);
        element.x1 = newPoints[0][0];
        element.y1 = newPoints[0][1];
        element.x2 = newPoints[1][0];
        element.y2 = newPoints[1][1];
    }

    private handleResizeMove(editor: any, event: CanvasEvent, element: any, handler: string) {
        const [minWidth, minHeight] = getElementMinimumSize(element) || [0, 0];
        if (isNodeHandler(handler)) {
            if (handler === HANDLERS.NODE_START) {
                element.x1 = this.getPosition(editor, this.snapshot[0].x1 + ((event.dx || 0) || 0), SNAP_EDGE_X);
                element.y1 = this.getPosition(editor, this.snapshot[0].y1 + ((event.dy || 0) || 0), SNAP_EDGE_Y);
            }
            else if (handler === HANDLERS.NODE_END) {
                element.x2 = this.getPosition(editor, this.snapshot[0].x2 + ((event.dx || 0) || 0), SNAP_EDGE_X);
                element.y2 = this.getPosition(editor, this.snapshot[0].y2 + ((event.dy || 0) || 0), SNAP_EDGE_Y);
            }
        }
        else if (isCornerHandler(handler) || isEdgeHandler(handler)) {
            const rect = getRectangle([this.snapshot[0].x1, this.snapshot[0].y1], [this.snapshot[0].x2, this.snapshot[0].y2], this.snapshot[0].rotation);
            if (isCornerHandler(handler)) {
                this.handleCornerResizeMove(editor, event, element, handler, rect, minWidth, minHeight);
            }
            else {
                this.handleEdgeResizeMove(editor, event, element, handler, rect, minWidth, minHeight);
            }
        }
    }

    private handleCornerResizeMove(editor: any, event: CanvasEvent, element: any, handler: string, rect: Point[], minWidth: number, minHeight: number) {
        const [width, height] = getElementSize(this.snapshot[0]);
        const diagLen = Math.hypot(width, height);
        let axisDir: Point = [0, 0];
        let fixedIndex = 0;
        // let movingField: "x1" | "y1" | "x2" | "y2" = "x1"; // dummy
        // let altField: "x1" | "y1" | "x2" | "y2" = "x2"; // dummy
        let cornerType: any = "";

        if (handler === HANDLERS.CORNER_TOP_LEFT) {
            axisDir = [(-1) * width / diagLen, (-1) * height / diagLen];
            fixedIndex = 2;
            cornerType = "top-left";
        } else if (handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
            axisDir = [width / diagLen, height / diagLen];
            fixedIndex = 0;
            cornerType = "bottom-right";
        } else if (handler === HANDLERS.CORNER_TOP_RIGHT) {
            axisDir = [(-1) * width / diagLen, height / diagLen];
            fixedIndex = 3;
            cornerType = "top-right";
        } else if (handler === HANDLERS.CORNER_BOTTOM_LEFT) {
            axisDir = [width / diagLen, (-1) * height / diagLen];
            fixedIndex = 1;
            cornerType = "bottom-left";
        }

        const [gDx, gDy] = computeResizeDelta([(event.dx || 0), (event.dy || 0)], this.snapshot[0].rotation, axisDir, event.shiftKey);
        const basePoint = (handler === HANDLERS.CORNER_TOP_LEFT) ? [this.snapshot[0].x1, this.snapshot[0].y1] :
            (handler === HANDLERS.CORNER_BOTTOM_RIGHT) ? [this.snapshot[0].x2, this.snapshot[0].y2] :
                (handler === HANDLERS.CORNER_TOP_RIGHT) ? rect[1] : rect[3];

        const newCorner: Point = [
            this.getPosition(editor, basePoint[0] + gDx, null),
            this.getPosition(editor, basePoint[1] + gDy, null),
        ];
        const clampedCorner = clampCornerResizeToMinSize(rect[fixedIndex], newCorner, this.snapshot[0].rotation, minWidth, minHeight, cornerType);

        if (handler === HANDLERS.CORNER_TOP_LEFT) {
            element.x1 = clampedCorner[0];
            element.y1 = clampedCorner[1];
        } else if (handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
            element.x2 = clampedCorner[0];
            element.y2 = clampedCorner[1];
        } else {
            const newRect = getRectangle(rect[fixedIndex], clampedCorner, this.snapshot[0].rotation);
            element.x1 = newRect[3][0];
            element.y1 = newRect[3][1];
            element.x2 = newRect[1][0];
            element.y2 = newRect[1][1];
        }
    }

    private handleEdgeResizeMove(editor: any, event: CanvasEvent, element: any, handler: string, rect: Point[], minWidth: number, minHeight: number) {
        if (handler === HANDLERS.EDGE_TOP) {
            const edgeTopPoint = getCenter(rect[0], rect[1]);
            const currentPoint: Point = [
                this.getPosition(editor, edgeTopPoint[0] + (event.dx || 0), null),
                this.getPosition(editor, edgeTopPoint[1] + (event.dy || 0), null),
            ];
            const clampedPoint = clampEdgeResizeToMinSize(rect[3], currentPoint, this.snapshot[0].rotation, minHeight, "top");
            const newPoint = getPointProjectionToLine(clampedPoint, [rect[0], rect[3]]);
            element.x1 = newPoint[0];
            element.y1 = newPoint[1];
        }
        else if (handler === HANDLERS.EDGE_BOTTOM) {
            const edgeBottomPoint = getCenter(rect[2], rect[3]);
            const currentPoint: Point = [
                this.getPosition(editor, edgeBottomPoint[0] + (event.dx || 0), null),
                this.getPosition(editor, edgeBottomPoint[1] + (event.dy || 0), null),
            ];
            const clampedPoint = clampEdgeResizeToMinSize(rect[1], currentPoint, this.snapshot[0].rotation, minHeight, "bottom");
            const newPoint = getPointProjectionToLine(clampedPoint, [rect[1], rect[2]]);
            element.x2 = newPoint[0];
            element.y2 = newPoint[1];
        }
        else if (handler === HANDLERS.EDGE_LEFT) {
            const edgeLeftPoint = getCenter(rect[0], rect[3]);
            const currentPoint: Point = [
                this.getPosition(editor, edgeLeftPoint[0] + (event.dx || 0), null),
                this.getPosition(editor, edgeLeftPoint[1] + (event.dy || 0), null),
            ];
            const clampedPoint = clampEdgeResizeToMinSize(rect[2], currentPoint, this.snapshot[0].rotation, minWidth, "left");
            const newPoint = getPointProjectionToLine(clampedPoint, [rect[0], rect[1]]);
            element.x1 = newPoint[0];
            element.y1 = newPoint[1];
        }
        else if (handler === HANDLERS.EDGE_RIGHT) {
            const edgeRightPoint = getCenter(rect[1], rect[2]);
            const currentPoint: Point = [
                this.getPosition(editor, edgeRightPoint[0] + (event.dx || 0), null),
                this.getPosition(editor, edgeRightPoint[1] + (event.dy || 0), null),
            ];
            const clampedPoint = clampEdgeResizeToMinSize(rect[0], currentPoint, this.snapshot[0].rotation, minHeight, "right");
            const newPoint = getPointProjectionToLine(clampedPoint, [rect[2], rect[3]]);
            element.x2 = newPoint[0];
            element.y2 = newPoint[1];
        }
    }

    onPointerMove({ editor, event }: ToolEventParams) {
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;

        // translate
        if (this.snapshot.length > 0 && !handler) {
            this.handleTranslateMove(editor, event);
        }

        // resize
        else if (handler) {
            editor.state.snapEdges = [];
            this.activeSnapEdges = [];
            this.isResized = true;
            const element = editor.getElement(this.snapshot[0].id);
            const elementConfig = getElementConfig(element);

            if (handler === HANDLERS.ROTATION) {
                this.handleRotationMove(editor, event, element);
            }
            else {
                this.handleResizeMove(editor, event, element, handler);
            }

            // Execute onResize handler
            elementConfig?.onResize?.(element, this.snapshot[0], event, (pos: number) => this.getPosition(editor, pos));
            // Set visible snap edges
            if (editor?.appState?.snapToElements && this.activeSnapEdges.length > 0) {
                editor.state.snapEdges = this.activeSnapEdges.map((snapEdge: any) => ({
                    points: [
                        ...snapEdge.points,
                        ...(getElementSnappingPoints(element, snapEdge) || []),
                    ],
                }));
            }
        }
        // Brush selection
        else if (editor.state.selection) {
            editor.state.selection.x2 = event.currentX;
            editor.state.selection.y2 = event.currentY;
        }
    }

    onPointerUp({ editor, event }: ToolEventParams) {
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const handler = target?.dataset?.handler;
        const elementId = target?.dataset?.element;

        editor.state.snapEdges = [];

        // Handle translate/resize completion
        if (this.snapshot.length > 0) {
            if (this.isDragged || this.isResized) {
                if (handler && this.snapshot.length === 1) {
                    const element = editor.getElement(this.snapshot[0].id);
                    const elementConfig = getElementConfig(element);
                    if (typeof elementConfig.onResizeEnd === "function") {
                        elementConfig.onResizeEnd(element, this.snapshot[0], event);
                    }
                }
                const selectedElements = editor.getSelection();
                selectedElements.forEach((el: any) => el[FIELDS.VERSION] = el[FIELDS.VERSION] + 1);
                editor.addHistory({
                    type: CHANGES.UPDATE,
                    elements: selectedElements.map((element: any, index: number) => {
                        const updatedFields = new Set(["x1", "x2", "y1", "y2", "rotation", "version"]);
                        const elementConfig = getElementConfig(element);
                        if (typeof elementConfig.getUpdatedFields === "function") {
                            (elementConfig.getUpdatedFields(element, this.snapshot[index]) || []).forEach((key: string) => {
                                updatedFields.add(key);
                            });
                        }
                        const keys = Array.from(updatedFields);
                        return {
                            id: element.id,
                            prevValues: Object.fromEntries(keys.map(key => [key, this.snapshot[index][key]])),
                            newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                        };
                    }),
                });
                editor.dispatchChange();
            }
            else if (elementId) {
                const element = editor.getElement(elementId);
                if (!event.shiftKey) {
                    editor.clearSelection();
                    element.selected = true;
                }
                else {
                    element.selected = !this.isPrevSelected;
                }
                if (element.group && !editor.page.activeGroup) {
                    editor.getElements().forEach((el: any) => {
                        el.selected = el.group === element.group ? element.selected : el.selected;
                    });
                }
            }
            this.isDragged = false;
            this.isResized = false;
        }
        // Finalize brush selection
        else if (editor.state.selection) {
            const selection = editor.state.selection;
            editor.setSelectionArea({
                x1: Math.min(selection.x1, selection.x2),
                x2: Math.max(selection.x1, selection.x2),
                y1: Math.min(selection.y1, selection.y2),
                y2: Math.max(selection.y1, selection.y2),
            });
        }
        editor.state.selection = null;
    }

    onDoubleClick({ editor, event }: ToolEventParams) {
        const target = event.originalEvent?.target as HTMLElement | undefined;
        const elementId = target?.dataset?.element;

        if (elementId && !editor.page.readonly) {
            const element = editor.getElement(elementId);
            if (!editor.page.activeGroup && element.group) {
                editor.page.activeGroup = element.group;
                editor.clearSelection();
                element.selected = true;
            }
            else if (element && !element.locked) {
                this.activeElement = element;
                this.activeElement.editing = true;
            }
        }
    }

    onKeyDown({ editor, event }: ToolEventParams): boolean | void {
        if (editor.page.readonly) {
            return;
        }
        const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
        // Check if we are in an input target and input element is active
        if (isInputTarget(event)) {
            if (this.activeElement?.editing && event.key === KEYS.ESCAPE) {
                event.preventDefault();
                this.activeElement.editing = false;
                if (this.activeElement.type === ELEMENTS.TEXT && !this.activeElement.text) {
                    removeTextElement(editor, this.activeElement);
                }
                this.activeElement = null;
                return true; // signal that event was handled
            }
        }
        // Check ESCAPE key
        else if (event.key === KEYS.ESCAPE) {
            if (editor?.page?.activeGroup) {
                editor.page.activeGroup = null;
            }
            event.preventDefault();
            editor.clearSelection();
            return true;
        }
        // Check for arrow keys → move elements
        else if (!isCtrlKey && isArrowKey(event.key)) {
            event.preventDefault();
            const dir = (event.key === KEYS.ARROW_UP || event.key === KEYS.ARROW_DOWN) ? "y" : "x";
            const sign = (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ARROW_RIGHT) ? +1 : -1;
            const selectedElements = editor.getSelection();
            if (selectedElements.length === 0) return;
            editor.addHistory({
                type: CHANGES.UPDATE,
                ids: selectedElements.map((el: any) => el.id).join(","),
                keys: `${dir}1,${dir}2`,
                elements: selectedElements.map((el: any) => {
                    const snap = { ...el };
                    const elementConfig = getElementConfig(el);
                    const field1 = `${dir}1`, field2 = `${dir}2`;
                    const fields = [field1, field2];
                    if (typeof elementConfig.getUpdatedFields === "function") {
                        (elementConfig.getUpdatedFields(el) || []).forEach((f: string) => fields.push(f));
                    }
                    el[field1] = event.shiftKey ? snap[field1] + sign : this.getPosition(editor, snap[field1] + sign * GRID_SIZE);
                    el[field2] = event.shiftKey ? snap[field2] + sign : this.getPosition(editor, snap[field2] + sign * GRID_SIZE);
                    if (typeof elementConfig.onDrag === "function") {
                        elementConfig.onDrag(el, snap, null);
                    }
                    return {
                        id: el.id,
                        prevValues: Object.fromEntries(fields.map((field: string) => [field, snap[field]])),
                        newValues: Object.fromEntries(fields.map((field: string) => [field, el[field]])),
                    };
                }),
            });
            editor.dispatchChange();
            return true;
        }
        return false; // event not handled by this tool
    }

    renderCanvas({ editor }: ToolRenderingParams): React.JSX.Element {
        const selection = editor.state.selection;
        return (
            <React.Fragment>
                <Bounds />
                <Handlers />
                {selection && (
                    <Brush {...selection} /> 
                )}
                {editor.appState.snapToElements && (
                    <SnapEdges edges={editor.state.snapEdges || []} />
                )}
                {editor.appState.objectDimensions && (
                    <Dimensions />
                )}
            </React.Fragment>
        );
    }
};
