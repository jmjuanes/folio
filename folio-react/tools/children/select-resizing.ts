import {
    FIELDS,
    CHANGES,
    HANDLERS,
    SNAP_EDGE_X,
    SNAP_EDGE_Y,
} from "../../constants.js";
import { ToolState } from "../../lib/tool.ts";
import {
    getElementConfig,
    getElementMinimumSize,
    getElementSize,
    getElementSnappingPoints,
    getElementsSnappingEdges,
} from "../../lib/elements.js";
import { getSnappedCoordinate } from "../utils/element.ts";
import {
    isNodeHandler,
    isCornerHandler,
    isEdgeHandler,
    computeResizeDelta,
    clampCornerResizeToMinSize,
    clampEdgeResizeToMinSize,
} from "../../lib/handlers.ts";
import {
    getRectangle,
    getPointProjectionToLine,
    getCenter,
} from "../../utils/math.ts";

import type { EditorPointEvent } from "../../lib/events.ts";
import type { Point } from "../../utils/math.ts";

export class SelectResizingState extends ToolState {
    private resized: boolean = false;
    private handler: string | null = null;
    private snapshot: any[] = [];
    public snapEdges: any[] = [];
    public activeSnapEdges: any[] = [];

    private getPosition(value: number, edge: string | null): number {
        return getSnappedCoordinate(value, !!this.editor.appState?.grid, !!this.editor.appState?.snapToElements, this.snapEdges, this.activeSnapEdges, edge, 0, false);
    }

    onEnter(params: any) {
        const selectedElements = this.editor.getSelection();
        const notSelectedElements = this.editor.getElements().filter((element: any) => {
            return !element.selected;
        });

        this.resized = false;
        this.handler = params.handler;
        this.snapshot = selectedElements.map((element: any) => Object.assign({}, element));
        this.snapEdges = this.editor?.appState?.snapToElements ? getElementsSnappingEdges(notSelectedElements) : [];
        this.activeSnapEdges = [];

        // execute onResizeStart handler in all selected elements
        selectedElements.forEach((element: any, index: number) => {
            const elementConfig = getElementConfig(element);
            if (typeof elementConfig.onResizeStart === "function") {
                elementConfig.onResizeStart(element, this.handler, this.snapshot[index], params?.event);
            }
        });

        this.editor.setSnaps([]);
    }

    onPointerMove(event: EditorPointEvent) {
        if (!this.handler) {
            return;
        }

        this.resized = true;
        this.activeSnapEdges = [];
        const element = this.editor.getElement(this.snapshot[0].id);
        const elementConfig = getElementConfig(element);

        if (isNodeHandler(this.handler)) {
            if (this.handler === HANDLERS.NODE_START) {
                element.x1 = this.getPosition(this.snapshot[0].x1 + event.dx, SNAP_EDGE_X);
                element.y1 = this.getPosition(this.snapshot[0].y1 + event.dy, SNAP_EDGE_Y);
            }
            else if (this.handler === HANDLERS.NODE_END) {
                element.x2 = this.getPosition(this.snapshot[0].x2 + event.dx, SNAP_EDGE_X);
                element.y2 = this.getPosition(this.snapshot[0].y2 + event.dy, SNAP_EDGE_Y);
            }
        }
        else if (isCornerHandler(this.handler) || isEdgeHandler(this.handler)) {
            const rect = getRectangle([this.snapshot[0].x1, this.snapshot[0].y1], [this.snapshot[0].x2, this.snapshot[0].y2], this.snapshot[0].rotation);
            const [minWidth, minHeight] = getElementMinimumSize(element);
            if (isCornerHandler(this.handler)) {
                const [width, height] = getElementSize(this.snapshot[0]);
                const diagLen = Math.hypot(width, height);
                if (this.handler === HANDLERS.CORNER_TOP_LEFT) {
                    const axisDir = [(-1) * width / diagLen, (-1) * height / diagLen];
                    const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], this.snapshot[0].rotation, axisDir, event.shiftKey);
                    const newCorner: Point = [
                        this.getPosition(this.snapshot[0].x1 + gDx, null),
                        this.getPosition(this.snapshot[0].y1 + gDy, null),
                    ];
                    const clampedCorner = clampCornerResizeToMinSize(rect[2], newCorner, this.snapshot[0].rotation, minWidth, minHeight, "top-left");
                    element.x1 = clampedCorner[0];
                    element.y1 = clampedCorner[1];
                }
                else if (this.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                    const axisDir = [width / diagLen, height / diagLen];
                    const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], this.snapshot[0].rotation, axisDir, event.shiftKey);
                    const newCorner: Point = [
                        this.getPosition(this.snapshot[0].x2 + gDx, null),
                        this.getPosition(this.snapshot[0].y2 + gDy, null),
                    ];
                    const clampedCorner = clampCornerResizeToMinSize(rect[0], newCorner, this.snapshot[0].rotation, minWidth, minHeight, "bottom-right");
                    element.x2 = clampedCorner[0];
                    element.y2 = clampedCorner[1];
                }
                else if (this.handler === HANDLERS.CORNER_TOP_RIGHT) {
                    const axisDir = [(-1) * width / diagLen, height / diagLen];
                    const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], this.snapshot[0].rotation, axisDir, event.shiftKey);
                    const newCorner: Point = [
                        this.getPosition(rect[1][0] + gDx, null),
                        this.getPosition(rect[1][1] + gDy, null),
                    ];
                    const clampedCorner = clampCornerResizeToMinSize(rect[3], newCorner, this.snapshot[0].rotation, minWidth, minHeight, "top-right");
                    const newRect = getRectangle(rect[3], clampedCorner, this.snapshot[0].rotation);
                    element.x1 = newRect[3][0];
                    element.y1 = newRect[3][1];
                    element.x2 = newRect[1][0];
                    element.y2 = newRect[1][1];
                }
                else if (this.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                    const axisDir = [width / diagLen, (-1) * height / diagLen];
                    const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], this.snapshot[0].rotation, axisDir, event.shiftKey);
                    const newCorner: Point = [
                        this.getPosition(rect[3][0] + gDx, null),
                        this.getPosition(rect[3][1] + gDy, null),
                    ];
                    const clampedCorner = clampCornerResizeToMinSize(rect[1], newCorner, this.snapshot[0].rotation, minWidth, minHeight, "bottom-left");
                    const newRect = getRectangle(clampedCorner, rect[1], this.snapshot[0].rotation);
                    element.x1 = newRect[3][0];
                    element.y1 = newRect[3][1];
                    element.x2 = newRect[1][0];
                    element.y2 = newRect[1][1];
                }
            }
            else {
                if (this.handler === HANDLERS.EDGE_TOP) {
                    const edgeTopPoint = getCenter(rect[0], rect[1]);
                    const currentPoint: Point = [
                        this.getPosition(edgeTopPoint[0] + event.dx, null),
                        this.getPosition(edgeTopPoint[1] + event.dy, null),
                    ];
                    const clampedPoint = clampEdgeResizeToMinSize(rect[3], currentPoint, this.snapshot[0].rotation, minHeight, "top");
                    const newPoint = getPointProjectionToLine(clampedPoint, [rect[0], rect[3]]);
                    element.x1 = newPoint[0];
                    element.y1 = newPoint[1];
                }
                else if (this.handler === HANDLERS.EDGE_BOTTOM) {
                    const edgeBottomPoint = getCenter(rect[2], rect[3]);
                    const currentPoint: Point = [
                        this.getPosition(edgeBottomPoint[0] + event.dx, null),
                        this.getPosition(edgeBottomPoint[1] + event.dy, null),
                    ];
                    const clampedPoint = clampEdgeResizeToMinSize(rect[1], currentPoint, this.snapshot[0].rotation, minHeight, "bottom");
                    const newPoint = getPointProjectionToLine(clampedPoint, [rect[1], rect[2]]);
                    element.x2 = newPoint[0];
                    element.y2 = newPoint[1];
                }
                else if (this.handler === HANDLERS.EDGE_LEFT) {
                    const edgeLeftPoint = getCenter(rect[0], rect[3]);
                    const currentPoint: Point = [
                        this.getPosition(edgeLeftPoint[0] + event.dx, null),
                        this.getPosition(edgeLeftPoint[1] + event.dy, null),
                    ];
                    const clampedPoint = clampEdgeResizeToMinSize(rect[2], currentPoint, this.snapshot[0].rotation, minWidth, "left");
                    const newPoint = getPointProjectionToLine(clampedPoint, [rect[0], rect[1]]);
                    element.x1 = newPoint[0];
                    element.y1 = newPoint[1];
                }
                else if (this.handler === HANDLERS.EDGE_RIGHT) {
                    const edgeRightPoint = getCenter(rect[1], rect[2]);
                    const currentPoint: Point = [
                        this.getPosition(edgeRightPoint[0] + event.dx, null),
                        this.getPosition(edgeRightPoint[1] + event.dy, null),
                    ];
                    const clampedPoint = clampEdgeResizeToMinSize(rect[0], currentPoint, this.snapshot[0].rotation, minHeight, "right");
                    const newPoint = getPointProjectionToLine(clampedPoint, [rect[2], rect[3]]);
                    element.x2 = newPoint[0];
                    element.y2 = newPoint[1];
                }
            }
        }
        // Execute onResize handler
        elementConfig?.onResize?.(element, this.handler, this.snapshot[0], event, (value: number, edge: string) => this.getPosition(value, edge));

        // Set visible snap edges
        this.editor.setSnaps([]);
        if (this.editor?.appState?.snapToElements && this.activeSnapEdges.length > 0) {
            this.editor.setSnaps(this.activeSnapEdges.map(snapEdge => ({
                ...snapEdge,
                points: [
                    ...snapEdge.points,
                    ...(getElementSnappingPoints(element, snapEdge) || []),
                ],
            })));
        }
    }

    onPointerUp(event: EditorPointEvent) {
        if (this.resized && this.handler) {
            const selectedElements = this.editor.getSelection();
            // execute onResizeEnd listener in all elements
            selectedElements.forEach((element: any, index: number) => {
                const elementConfig = getElementConfig(element);
                if (typeof elementConfig.onResizeEnd === "function") {
                    elementConfig.onResizeEnd(element, this.handler, this.snapshot[index], event);
                }
            });
            // update version in all elements of the selection
            selectedElements.forEach((element: any) => {
                element[FIELDS.VERSION] = element[FIELDS.VERSION] + 1;
            });
            // register history change
            this.editor.addHistory({
                type: CHANGES.UPDATE,
                elements: selectedElements.map((element: any, index: number) => {
                    const updatedFields = new Set(["x1", "x2", "y1", "y2", "rotation", "version"]);
                    // We need to check the fields that the element has updated internally
                    const elementConfig = getElementConfig(element);
                    if (typeof elementConfig.getUpdatedFields === "function") {
                        (elementConfig.getUpdatedFields(element, this.snapshot[index]) || []).forEach(key => {
                            updatedFields.add(key);
                        });
                    }
                    // Generate list of fields to update
                    const keys = Array.from(updatedFields);
                    return {
                        id: element.id,
                        prevValues: Object.fromEntries(keys.map(key => [key, this.snapshot[index][key]])),
                        newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                    };
                }),
            });
            // dispatch change event in editor
            this.editor.dispatchChange();
        }
        // reset internal variables
        this.editor.setSnaps([]);
        this.parent?.transition("idle");
        this.handler = null;
        this.resized = false;
    }
}

