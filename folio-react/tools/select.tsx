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
    PREFERENCES,
    NONE,
    BOUNDS_STROKE_COLOR,
    BOUNDS_STROKE_WIDTH,
    BOUNDS_STROKE_DASH,
    BRUSH_FILL_COLOR,
    BRUSH_FILL_OPACITY,
    BRUSH_STROKE_COLOR,
    BRUSH_STROKE_WIDTH,
    BRUSH_STROKE_DASH,
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
    getElementNormalizedPosition,
    getElementBounds,
    getElementSize,
    getElementMinimumSize,
} from "../lib/elements.js";
import { getRectanglePath } from "../utils/paths.js";
import {
    isCornerHandler,
    isEdgeHandler,
    isNodeHandler,
    computeResizeDelta,
    clampCornerResizeToMinSize,
    clampEdgeResizeToMinSize,
} from "../lib/handlers.ts";
import { SvgContainer } from "../components/svg.tsx";
import { TOOL_TYPE } from "../contexts/tools.tsx";
import type { Tool } from "../contexts/tools.tsx";

// ---- Module-global state ----
let snapshot: any[] = [];
let snapshotBounds: any = null;
let snapEdges: any[] = [];
let activeSnapEdges: any[] = [];
let activeElement: any = null;
let isDragged = false;
let isResized = false;
let isPrevSelected = false;

// @private get position based on the grid/snap state
const getPosition = (editor: any, pos: number, edge: string | null = null, size: number = 0, includeCenter: boolean = false): number => {
    // 1. Check if grid mode is enabled
    if (editor?.appState?.grid) {
        return Math.round(pos / GRID_SIZE) * GRID_SIZE;
    }
    // 2. check if snap mode is enabled
    if (edge && editor?.appState?.snapToElements) {
        const edges = size > 0 ? (includeCenter ? [0, size / 2, size] : [0, size]) : [0];
        for (let i = 0; i < snapEdges.length; i++) {
            const item = snapEdges[i];
            if (item.edge === edge && typeof item[edge] !== "undefined") {
                for (let j = 0; j < edges.length; j++) {
                    if (Math.abs(item[edge] - pos - edges[j]) < SNAP_THRESHOLD) {
                        activeSnapEdges.push(item);
                        return item[edge] - edges[j];
                    }
                }
            }
        }
    }
    // 3: just return the new position
    return pos;
};

// @private remove the current text element
const removeTextElement = (editor: any, element: any) => {
    const history = editor.getHistory();
    if (history[0]?.type === CHANGES.CREATE && history[0]?.elements?.[0]?.id === element.id) {
        history.shift();
    }
    editor.removeElements([element]);
    editor.dispatchChange();
};

// alias to generate the rectangle path from two points
const getRectanglePathFromPoints = (p1: number[], p2: number[]): string => {
    return getRectanglePath([[p1[0], p1[1]], [p2[0], p1[1]], [p2[0], p2[1]], [p1[0], p2[1]]]);
};

// @private Bounds rendering component
const SelectBoundsCanvas = (props: { editor: any }) => {
    const editor = props.editor;
    const bounds: any[] = [];
    let hasCustomBounds = false;
    const selectedElements = editor.getSelection();

    // 1. Check for active group
    if (editor.page.activeGroup) {
        const elementsInGroup = editor.getElements().filter((el: any) => el.group === editor.page.activeGroup);
        if (elementsInGroup.length > 0) {
            const p = getElementsBoundingRectangle(elementsInGroup);
            bounds.push({
                path: getRectanglePathFromPoints(p[0], p[1]),
                strokeWidth: 2,
                strokeDasharray: 5,
            });
        }
    }

    // 2. Check if there is only one element in the selection
    if (selectedElements.length === 1) {
        (getElementBounds(selectedElements[0]) || []).forEach((elementBound: any) => {
            bounds.push(elementBound);
            hasCustomBounds = true;
        });
    }

    // 3. Generate default bounds for selected elements
    if (selectedElements.length > 0) {
        const hasGroupInSelection = selectedElements.some((el: any) => el.group && el.group !== editor.page.activeGroup);
        if (hasGroupInSelection) {
            const groups = new Set(selectedElements.map((el: any) => el.group).filter((g: any) => !!g));
            Array.from(groups).forEach((group: any) => {
                const elements = selectedElements.filter((el: any) => el.group === group);
                const p = getElementsBoundingRectangle(elements);
                bounds.push({
                    path: getRectanglePathFromPoints(p[0], p[1]),
                    strokeWidth: 2,
                    strokeDasharray: 5,
                });
            });
        }
        if (!hasCustomBounds) {
            const p = getElementsBoundingRectangle(selectedElements);
            bounds.push({
                path: getRectanglePathFromPoints(p[0], p[1]),
                strokeWidth: 4,
            });
        }
    }

    // Render bounds and brush
    const selection = editor.state.selection;
    const zoom = editor.page.zoom;

    return (
        <React.Fragment>
            {bounds.length > 0 && (
                <SvgContainer>
                    {bounds.map((bound: any, index: number) => (
                        <path
                            key={index}
                            d={bound.path ?? ""}
                            fill={NONE}
                            stroke={bound.strokeColor ?? BOUNDS_STROKE_COLOR}
                            strokeWidth={(bound.strokeWidth ?? BOUNDS_STROKE_WIDTH) / zoom}
                            strokeDasharray={(bound.strokeDasharray ?? BOUNDS_STROKE_DASH) ?? null}
                        />
                    ))}
                </SvgContainer>
            )}
            {selection && (
                <SvgContainer>
                    <rect
                        x={Math.min(selection.x1, selection.x2)}
                        y={Math.min(selection.y1, selection.y2)}
                        width={Math.abs(selection.x2 - selection.x1)}
                        height={Math.abs(selection.y2 - selection.y1)}
                        fill={BRUSH_FILL_COLOR}
                        fillOpacity={BRUSH_FILL_OPACITY}
                        stroke={BRUSH_STROKE_COLOR}
                        strokeWidth={BRUSH_STROKE_WIDTH / zoom}
                        strokeDasharray={BRUSH_STROKE_DASH / zoom}
                    />
                </SvgContainer>
            )}
        </React.Fragment>
    );
};

export const SelectTool: Tool = {
    id: TOOLS.SELECT,
    type: TOOL_TYPE.CORE,
    name: "Select",
    icon: "pointer",
    primary: true,
    keyboardShortcut: "v",

    onActivate: (editor, self) => {
        // Reset module state
        snapshot = [];
        snapshotBounds = null;
        snapEdges = [];
        activeSnapEdges = [];
        isDragged = false;
        isResized = false;
        isPrevSelected = false;
    },

    onPointCanvas: (editor, self, event) => {
        editor.state.snapEdges = [];
        if (activeElement) {
            if (activeElement?.editing) {
                if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                    removeTextElement(editor, activeElement);
                }
            }
            activeElement.editing = false;
            activeElement = null;
        }
        // Check if we have an active group
        if (editor.page.activeGroup) {
            editor.page.activeGroup = null;
        }
        editor.clearSelection();
    },

    onPointElement: (editor, self, event) => {
        const element = editor.getElement(event.element);
        isPrevSelected = element.selected;
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
    },

    onPointerDown: (editor, self, event) => {
        isDragged = false;
        isResized = false;
        snapshot = [];
        const selectedElements = editor.getSelection();

        // First check if we are in an edit action
        if (activeElement?.editing) {
            if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                removeTextElement(editor, activeElement);
            }
            activeElement = null;
        }

        // Check if we have selected elements
        if (selectedElements.length > 0) {
            if (!selectedElements.some((el: any) => el.locked)) {
                snapshot = editor.getSelection().map((el: any) => ({ ...el }));
                snapshotBounds = getElementsBoundingRectangle(snapshot);
                // Check for calling the onResizeStart listener
                if (event.handler && snapshot.length === 1) {
                    const element = editor.getElement(snapshot[0].id);
                    const elementConfig = getElementConfig(element);
                    if (typeof elementConfig.onResizeStart === "function") {
                        elementConfig.onResizeStart(element, snapshot[0], event);
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
        snapEdges = [];
        activeSnapEdges = [];
        if (selectedElements.length > 0) {
            if (editor?.appState?.snapToElements) {
                snapEdges = getElementsSnappingEdges(editor.getElements());
            }
        }
    },

    onPointerMove: (editor, self, event) => {
        // Translate
        if (snapshot.length > 0 && !event.handler) {
            editor.state.snapEdges = [];
            activeSnapEdges = [];
            editor.state.status = STATUS.TRANSLATING;
            isDragged = true;
            const elements = editor.getSelection();
            const includeCenter = elements.length > 1 || elements[0].type !== ELEMENTS.ARROW;
            const dx = getPosition(editor, snapshotBounds[0][0] + event.dx, SNAP_EDGE_X, snapshotBounds[1][0] - snapshotBounds[0][0], includeCenter) - snapshotBounds[0][0];
            const dy = getPosition(editor, snapshotBounds[0][1] + event.dy, SNAP_EDGE_Y, snapshotBounds[1][1] - snapshotBounds[0][1], includeCenter) - snapshotBounds[0][1];
            elements.forEach((element: any, index: number) => {
                element.x1 = snapshot[index].x1 + dx;
                element.x2 = snapshot[index].x2 + dx;
                element.y1 = snapshot[index].y1 + dy;
                element.y2 = snapshot[index].y2 + dy;
                getElementConfig(element)?.onDrag?.(element, snapshot[index], event);
            });
            if (editor?.appState?.snapToElements && activeSnapEdges.length > 0) {
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
                editor.state.snapEdges = activeSnapEdges.map((snapEdge: any) => ({
                    points: [
                        ...snapEdge.points,
                        ...getElementSnappingPoints(boundElement, snapEdge),
                    ],
                }));
            }
        }
        // Resize
        else if (event.handler) {
            editor.state.snapEdges = [];
            editor.state.status = STATUS.RESIZING;
            activeSnapEdges = [];
            isResized = true;
            const element = editor.getElement(snapshot[0].id);
            const elementConfig = getElementConfig(element);
            if (event.handler === HANDLERS.ROTATION) {
                const cx = (snapshot[0].x1 + snapshot[0].x2) / 2;
                const cy = (snapshot[0].y1 + snapshot[0].y2) / 2;
                const prevAngle = Math.atan2(event.originalY - cy, event.originalX - cx) + Math.PI / 2;
                const currentAngle = Math.atan2(event.currentY - cy, event.currentX - cx) + Math.PI / 2;
                const deltaAngle = clampAngle(event.shiftKey ? snapAngle(currentAngle - prevAngle) : currentAngle - prevAngle);
                const angle = clampAngle((snapshot[0].rotation || 0) + deltaAngle);
                element.rotation = angle;
                const newPoints = rotatePoints([[snapshot[0].x1, snapshot[0].y1], [snapshot[0].x2, snapshot[0].y2]], [cx, cy], deltaAngle);
                element.x1 = newPoints[0][0];
                element.y1 = newPoints[0][1];
                element.x2 = newPoints[1][0];
                element.y2 = newPoints[1][1];
            }
            else {
                if (isNodeHandler(event.handler)) {
                    if (event.handler === HANDLERS.NODE_START) {
                        element.x1 = getPosition(editor, snapshot[0].x1 + event.dx, SNAP_EDGE_X);
                        element.y1 = getPosition(editor, snapshot[0].y1 + event.dy, SNAP_EDGE_Y);
                    }
                    else if (event.handler === HANDLERS.NODE_END) {
                        element.x2 = getPosition(editor, snapshot[0].x2 + event.dx, SNAP_EDGE_X);
                        element.y2 = getPosition(editor, snapshot[0].y2 + event.dy, SNAP_EDGE_Y);
                    }
                }
                else if (isCornerHandler(event.handler) || isEdgeHandler(event.handler)) {
                    const rect = getRectangle([snapshot[0].x1, snapshot[0].y1], [snapshot[0].x2, snapshot[0].y2], snapshot[0].rotation);
                    const [minWidth, minHeight] = getElementMinimumSize(element);
                    if (isCornerHandler(event.handler)) {
                        const [width, height] = getElementSize(snapshot[0]);
                        const diagLen = Math.hypot(width, height);
                        if (event.handler === HANDLERS.CORNER_TOP_LEFT) {
                            const axisDir = [(-1) * width / diagLen, (-1) * height / diagLen];
                            const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], snapshot[0].rotation, axisDir, event.shiftKey);
                            const newCorner = [
                                getPosition(editor, snapshot[0].x1 + gDx, null),
                                getPosition(editor, snapshot[0].y1 + gDy, null),
                            ];
                            const clampedCorner = clampCornerResizeToMinSize(rect[2], newCorner, snapshot[0].rotation, minWidth, minHeight, "top-left");
                            element.x1 = clampedCorner[0];
                            element.y1 = clampedCorner[1];
                        }
                        else if (event.handler === HANDLERS.CORNER_BOTTOM_RIGHT) {
                            const axisDir = [width / diagLen, height / diagLen];
                            const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], snapshot[0].rotation, axisDir, event.shiftKey);
                            const newCorner = [
                                getPosition(editor, snapshot[0].x2 + gDx, null),
                                getPosition(editor, snapshot[0].y2 + gDy, null),
                            ];
                            const clampedCorner = clampCornerResizeToMinSize(rect[0], newCorner, snapshot[0].rotation, minWidth, minHeight, "bottom-right");
                            element.x2 = clampedCorner[0];
                            element.y2 = clampedCorner[1];
                        }
                        else if (event.handler === HANDLERS.CORNER_TOP_RIGHT) {
                            const axisDir = [(-1) * width / diagLen, height / diagLen];
                            const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], snapshot[0].rotation, axisDir, event.shiftKey);
                            const newCorner = [
                                getPosition(editor, rect[1][0] + gDx, null),
                                getPosition(editor, rect[1][1] + gDy, null),
                            ];
                            const clampedCorner = clampCornerResizeToMinSize(rect[3], newCorner, snapshot[0].rotation, minWidth, minHeight, "top-right");
                            const newRect = getRectangle(rect[3], clampedCorner, snapshot[0].rotation);
                            element.x1 = newRect[3][0];
                            element.y1 = newRect[3][1];
                            element.x2 = newRect[1][0];
                            element.y2 = newRect[1][1];
                        }
                        else if (event.handler === HANDLERS.CORNER_BOTTOM_LEFT) {
                            const axisDir = [width / diagLen, (-1) * height / diagLen];
                            const [gDx, gDy] = computeResizeDelta([event.dx, event.dy], snapshot[0].rotation, axisDir, event.shiftKey);
                            const newCorner = [
                                getPosition(editor, rect[3][0] + gDx, null),
                                getPosition(editor, rect[3][1] + gDy, null),
                            ];
                            const clampedCorner = clampCornerResizeToMinSize(rect[1], newCorner, snapshot[0].rotation, minWidth, minHeight, "bottom-left");
                            const newRect = getRectangle(clampedCorner, rect[1], snapshot[0].rotation);
                            element.x1 = newRect[3][0];
                            element.y1 = newRect[3][1];
                            element.x2 = newRect[1][0];
                            element.y2 = newRect[1][1];
                        }
                    }
                    else {
                        if (event.handler === HANDLERS.EDGE_TOP) {
                            const edgeTopPoint = getCenter(rect[0], rect[1]);
                            const currentPoint = [
                                getPosition(editor, edgeTopPoint[0] + event.dx, null),
                                getPosition(editor, edgeTopPoint[1] + event.dy, null),
                            ];
                            const clampedPoint = clampEdgeResizeToMinSize(rect[3], currentPoint, snapshot[0].rotation, minHeight, "top");
                            const newPoint = getPointProjectionToLine(clampedPoint, [rect[0], rect[3]]);
                            element.x1 = newPoint[0];
                            element.y1 = newPoint[1];
                        }
                        else if (event.handler === HANDLERS.EDGE_BOTTOM) {
                            const edgeBottomPoint = getCenter(rect[2], rect[3]);
                            const currentPoint = [
                                getPosition(editor, edgeBottomPoint[0] + event.dx, null),
                                getPosition(editor, edgeBottomPoint[1] + event.dy, null),
                            ];
                            const clampedPoint = clampEdgeResizeToMinSize(rect[1], currentPoint, snapshot[0].rotation, minHeight, "bottom");
                            const newPoint = getPointProjectionToLine(clampedPoint, [rect[1], rect[2]]);
                            element.x2 = newPoint[0];
                            element.y2 = newPoint[1];
                        }
                        else if (event.handler === HANDLERS.EDGE_LEFT) {
                            const edgeLeftPoint = getCenter(rect[0], rect[3]);
                            const currentPoint = [
                                getPosition(editor, edgeLeftPoint[0] + event.dx, null),
                                getPosition(editor, edgeLeftPoint[1] + event.dy, null),
                            ];
                            const clampedPoint = clampEdgeResizeToMinSize(rect[2], currentPoint, snapshot[0].rotation, minWidth, "left");
                            const newPoint = getPointProjectionToLine(clampedPoint, [rect[0], rect[1]]);
                            element.x1 = newPoint[0];
                            element.y1 = newPoint[1];
                        }
                        else if (event.handler === HANDLERS.EDGE_RIGHT) {
                            const edgeRightPoint = getCenter(rect[1], rect[2]);
                            const currentPoint = [
                                getPosition(editor, edgeRightPoint[0] + event.dx, null),
                                getPosition(editor, edgeRightPoint[1] + event.dy, null),
                            ];
                            const clampedPoint = clampEdgeResizeToMinSize(rect[0], currentPoint, snapshot[0].rotation, minHeight, "right");
                            const newPoint = getPointProjectionToLine(clampedPoint, [rect[2], rect[3]]);
                            element.x2 = newPoint[0];
                            element.y2 = newPoint[1];
                        }
                    }
                }
                // Execute onResize handler
                elementConfig?.onResize?.(element, snapshot[0], event, (pos: number) => getPosition(editor, pos));
                // Set visible snap edges
                if (editor?.appState?.snapToElements && activeSnapEdges.length > 0) {
                    editor.state.snapEdges = activeSnapEdges.map((snapEdge: any) => ({
                        points: [
                            ...snapEdge.points,
                            ...getElementSnappingPoints(element, snapEdge),
                        ],
                    }));
                }
            }
        }
        // Brush selection
        else if (editor.state.selection) {
            editor.state.status = STATUS.BRUSHING;
            editor.state.selection.x2 = event.currentX;
            editor.state.selection.y2 = event.currentY;
        }
    },

    onPointerUp: (editor, self, event) => {
        editor.state.snapEdges = [];
        editor.state.status = STATUS.IDLE;

        // Handle translate/resize completion
        if (snapshot.length > 0) {
            if (isDragged || isResized) {
                if (event.handler && snapshot.length === 1) {
                    const element = editor.getElement(snapshot[0].id);
                    const elementConfig = getElementConfig(element);
                    if (typeof elementConfig.onResizeEnd === "function") {
                        elementConfig.onResizeEnd(element, snapshot[0], event);
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
                            (elementConfig.getUpdatedFields(element, snapshot[index]) || []).forEach((key: string) => {
                                updatedFields.add(key);
                            });
                        }
                        const keys = Array.from(updatedFields);
                        return {
                            id: element.id,
                            prevValues: Object.fromEntries(keys.map(key => [key, snapshot[index][key]])),
                            newValues: Object.fromEntries(keys.map(key => [key, element[key]])),
                        };
                    }),
                });
                editor.dispatchChange();
            }
            else if (event.element) {
                const element = editor.getElement(event.element);
                if (!event.shiftKey) {
                    editor.clearSelection();
                    element.selected = true;
                }
                else {
                    element.selected = !isPrevSelected;
                }
                if (element.group && !editor.page.activeGroup) {
                    editor.getElements().forEach((el: any) => {
                        el.selected = el.group === element.group ? element.selected : el.selected;
                    });
                }
            }
            isDragged = false;
            isResized = false;
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
    },

    onDoubleClickElement: (editor, self, event) => {
        if (!editor.page.readonly) {
            const element = editor.getElement(event.element);
            if (!editor.page.activeGroup && element.group) {
                editor.page.activeGroup = element.group;
                editor.clearSelection();
                element.selected = true;
            }
            else if (element && !element.locked) {
                activeElement = element;
                activeElement.editing = true;
            }
        }
    },

    onKeyDown: (editor, self, event) => {
        if (editor.page.readonly) {
            return null;
        }
        const isCtrlKey = IS_DARWIN ? event.metaKey : event.ctrlKey;
        // Check if we are in an input target and input element is active
        if (isInputTarget(event)) {
            if (activeElement?.editing && event.key === KEYS.ESCAPE) {
                event.preventDefault();
                activeElement.editing = false;
                if (activeElement.type === ELEMENTS.TEXT && !activeElement.text) {
                    removeTextElement(editor, activeElement);
                }
                activeElement = null;
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
                    el[field1] = event.shiftKey ? snap[field1] + sign : getPosition(editor, snap[field1] + sign * GRID_SIZE);
                    el[field2] = event.shiftKey ? snap[field2] + sign : getPosition(editor, snap[field2] + sign * GRID_SIZE);
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
    },

    onElementChange: (editor, self, event) => {
        if (activeElement?.id === event.element && activeElement?.editing) {
            editor.updateElements([activeElement], event.keys, event.values, true);
            editor.dispatchChange();
        }
    },

    onElementBlur: (editor, self, event) => {
        editor.getElements().forEach((element: any) => {
            element.editing = false;
        });
    },

    renderCanvas: (editor, self) => {
        return <SelectBoundsCanvas editor={editor} />;
    },
};
