import React from "react";
import {
    NONE,
    BOUNDS_STROKE_WIDTH,
    BOUNDS_STROKE_DASH,
    BOUNDS_STROKE_COLOR,
} from "../constants.js";
import {
    getElementsBoundingRectangle,
    getElementBounds,
} from "../lib/elements.js";
import { useEditor } from "../contexts/editor.tsx";
import { SvgContainer } from "./svg.tsx";
import { getRectanglePath } from "../utils/paths.js";
import type { Point } from "../utils/math.ts";

// alias to generate the rectangle path from two points
const getRectanglePathFromPoints = (p1: Point, p2: Point): string => {
    return getRectanglePath([[p1[0], p1[1]], [p2[0], p1[1]], [p2[0], p2[1]], [p1[0], p2[1]]]);
};

export const Bounds = (): React.JSX.Element => {
    const editor = useEditor();
    const bounds: any[] = [];
    let hasCustomBounds = false;
    const selectedElements = editor.getSelection();

    // 1. Check for active group
    if (editor.page.activeGroup) {
        const elementsInGroup = editor.getElements().filter((element: any) => {
            return element.group === editor.page.activeGroup;
        });
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

    return (
        <SvgContainer>
            {bounds.map((bound: any, index: number) => (
                <path
                    key={"bound:" + index}
                    d={bound.path ?? ""}
                    fill={NONE}
                    stroke={bound.strokeColor ?? BOUNDS_STROKE_COLOR}
                    strokeWidth={(bound.strokeWidth ?? BOUNDS_STROKE_WIDTH) / editor.page.zoom}
                    strokeDasharray={(bound.strokeDasharray ?? BOUNDS_STROKE_DASH) ?? null}
                />
            ))}
        </SvgContainer>
    );
};

