import { HANDLERS } from "../constants.js";
import { rotatePoints } from "../utils/math.ts";
import type { Point } from "../utils/math.ts";

export type Corner = "top-left" | "top-right" | "bottom-right" | "bottom-left";
export type Edge = "top" | "right" | "bottom" | "left";

export const isCornerHandler = (handler: string): boolean => {
    return handler.startsWith("corner");
};

export const isEdgeHandler = (handler: string): boolean => {
    return handler.startsWith("edge");
};

export const isVerticalEdgeHandler = (handler: string): boolean => {
    return handler === HANDLERS.EDGE_TOP || handler === HANDLERS.EDGE_BOTTOM;
};

export const isHorizontalEdgeHandler = (handler: string): boolean => {
    return handler === HANDLERS.EDGE_LEFT || handler === HANDLERS.EDGE_RIGHT;
};

export const isNodeHandler = (handler: string): boolean => {
    return handler.startsWith("node");
};

export const isRotationHandler = (handler: string): boolean => {
    return handler === HANDLERS.ROTATION;
};

// @description workaround to resize a rectangle from the given corner and angle
export const resizeFromFixedCorner = (corner: Point, width: number, height: number, rotation: number, fromCorner: Corner): Point => {
    const cos: number = Math.cos(rotation);
    const sin: number = Math.sin(rotation);
    const xAxis: [number, number] = [ cos, sin ];       // horizontal
    const yAxis: [number, number] = [ -sin, cos ];      // vertical

    // calculate the displacement direction according to the corner
    const dx = fromCorner.includes("right") ? -width : width;
    const dy = fromCorner.includes("bottom") ? -height : height;

    // return the opposite corner
    return [
        corner[0] + xAxis[0] * dx + yAxis[0] * dy,
        corner[1] + xAxis[1] * dx + yAxis[1] * dy,
    ];
};

// Compute the constrained global delta for any corner.
// - dx,dy are pointer deltas in screen coords.
// - angle is the element’s current rotation.
// - axisDir is the local direction you want to resize along
//   (e.g. [-1,-1] normalized for TOP_LEFT → BR diagonal).
// - lockAspect tells us to project onto axisDir, otherwise we keep full local delta.
export const computeResizeDelta = (delta: Point, angle: number, axisDir: Point, lockAspect: boolean = false): Point => {
    // 1. bring pointer delta into local coords
    const [ localDelta ] = rotatePoints([ delta ], [ 0, 0 ], -angle);
    let computedDeltaX = localDelta[0], computedDeltaY = localDelta[1];
    // 2. optionally project onto the “resize axis”
    if (lockAspect) {
        const projection = (localDelta[0] * axisDir[0]) + (localDelta[1] * axisDir[1]);
        computedDeltaX = projection * axisDir[0];
        computedDeltaY = projection * axisDir[1];
    }
    // 3. back to global coords
    return rotatePoints([ [ computedDeltaX, computedDeltaY ] ], [0, 0], angle)[0];
};

// Clamp the moving corner of a rotated rectangle to the provided minimum width and height.
// - fixedCorner is the stationary corner [x,y]
// - movingCorner is the corner being moved [x,y]
// - rotation is the rectangle’s rotation in radians
// - minWidth and minHeight are the minimum dimensions
// - corner is the corner being moved ("top-left", "top-right", "bottom-right", "bottom-left")
export const clampCornerResizeToMinSize = (fixedCorner: Point, movingCorner: Point, rotation: number, minWidth: number, minHeight: number, corner: Corner): Point => {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const xAxis: [number, number] = [ cos, sin ];  // horizontal
    const yAxis: [number, number] = [ -sin, cos ]; // vertical
    const vec: [number, number] = [
        movingCorner[0] - fixedCorner[0],
        movingCorner[1] - fixedCorner[1],
    ];
    // projected width and height on each axis
    const projectedWidth = vec[0] * xAxis[0] + vec[1] * xAxis[1];
    const projectedHeight = vec[0] * yAxis[0] + vec[1] * yAxis[1];
    // normalize the projections to the correct sign according to the corner
    const normalizedProjectedWidth = corner.includes("right") ? projectedWidth : (-1) * projectedWidth;
    const normalizedProjectedHeight = corner.includes("bottom") ? projectedHeight : (-1) * projectedHeight;
    const signX = corner.includes("right") ? 1 : -1;
    const signY = corner.includes("bottom") ? 1 : -1;
    // clamp to min dimensions while preserving the sign
    const clampedWidth = Math.max(minWidth, normalizedProjectedWidth) * signX; // Math.sign(projectedWidth);
    const clampedHeight = Math.max(minHeight, normalizedProjectedHeight) * signY; // Math.sign(projectedHeight);
    // return the clamped corner
    return [
        fixedCorner[0] + xAxis[0] * clampedWidth + yAxis[0] * clampedHeight,
        fixedCorner[1] + xAxis[1] * clampedWidth + yAxis[1] * clampedHeight
    ];
};

// Clamp the moving edge of a rotated rectangle to the provided minimum size.
// - fixedCorner is the stationary corner [x,y]
// - movingPoint is the point being moved [x,y]
// - rotation is the rectangle’s rotation in radians
// - minSize is the minimum dimension along the edge being moved
// - edge is the edge being moved ("top", "right", "bottom", "left")
export const clampEdgeResizeToMinSize = (fixedCorner: Point, movingPoint: Point, rotation: number, minSize: number, edge: Edge): Point => {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const axis: [number, number] = (edge === "left" || edge === "right") ? [ cos, sin ] : [ -sin, cos ];
    const vec: [number, number] = [
        movingPoint[0] - fixedCorner[0],
        movingPoint[1] - fixedCorner[1]
    ];
    // project onto the axis
    const projected = vec[0] * axis[0] + vec[1] * axis[1];
    const normalizedProjected = (edge === "bottom" || edge === "right") ? projected : (-1) * projected;
    const sign = (edge === "bottom" || edge === "right") ? 1 : -1;
    const clamped = Math.max(minSize, normalizedProjected) * sign;
    // return the clamped point
    return [
        fixedCorner[0] + axis[0] * clamped,
        fixedCorner[1] + axis[1] * clamped
    ];
};
