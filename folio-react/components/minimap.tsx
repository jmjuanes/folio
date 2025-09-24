import React from "react";
import {
    NONE,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT,
    MINIMAP_VISIBLE_FILL,
    MINIMAP_VISIBLE_RADIUS,
    MINIMAL_ELEMENT_FILL,
    MINIMAP_ELEMENT_RADIUS,
} from "../constants.js";
import { Island } from "./ui/island.jsx";
import { useEditor } from "../contexts/editor.jsx";
import { getElementsBoundingRectangle, getElementSize } from "../lib/elements.js";
import { convertRadiansToDegrees } from "../utils/math.ts";

export type MinimapProps = {
    width?: number,
    height?: number,
};

export type MinimapElement = {
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
};

// @description minimap panel component
export const Minimap = ({ width = MINIMAP_WIDTH, height = MINIMAP_HEIGHT }: MinimapProps): React.JSX.Element => {
    const editor = useEditor();
    // TODO: handle if minimap is not visible

    const minimap = React.useMemo(() => {
        if (!editor.width || !editor.height) {
            return null;
        }
        const bounds = editor.page.elements.length > 0 ? getElementsBoundingRectangle(editor.page.elements) : [];
        // calculate the start and end points for the minimap
        const x1 = Math.min(bounds[0]?.[0] ?? Infinity, (-1) * editor.page.translateX / editor.page.zoom);
        const y1 = Math.min(bounds[0]?.[1] ?? Infinity, (-1) * editor.page.translateY / editor.page.zoom);
        const x2 = Math.max(bounds[1]?.[0] ?? -Infinity, ((-1) * editor.page.translateX + editor.width) / editor.page.zoom);
        const y2 = Math.max(bounds[1]?.[1] ?? -Infinity, ((-1) * editor.page.translateY + editor.height) / editor.page.zoom);
        // calculate the scale factor for the minimap
        const ratio = Math.min(width / Math.max(1, x2 - x1), height / Math.max(1, y2 - y1));
        return {
            width: Math.min(width, (x2 - x1) * ratio),
            height: Math.min(height, (y2 - y1) * ratio),
            // ratio: ratio,
            elements: editor.page.elements.map((element: any) => {
                const [elementWidth, elementHeight, x, y] = getElementSize(element);
                return {
                    id: element.id,
                    x: x * ratio,
                    y: y * ratio,
                    width: elementWidth * ratio,
                    height: elementHeight * ratio,
                    rotation: convertRadiansToDegrees(element.rotation || 0),
                };
            }) as MinimapElement[],
            visibleX: (((-1) * editor.page.translateX / editor.page.zoom) - x1) * ratio, // update the visible x position
            visibleY: (((-1) * editor.page.translateY / editor.page.zoom) - y1) * ratio, // update the visible y position
            visibleWidth: editor.width * ratio / editor.page.zoom, // update the visible width
            visibleHeight: editor.height * ratio / editor.page.zoom, // update the visible height
        };
    }, [editor.updatedAt, editor.page.id, editor.width, editor.height, editor.page.zoom, editor.page.translateX, editor.page.translateY]);

    return (
        <Island className="items-center justify-center">
            {!!minimap && (
                <div className="flex items-center justify-center bg-white" style={{width: width, height: height}}>
                    <svg width={minimap.width} height={minimap.height}>
                        <rect
                            x={minimap.visibleX}
                            y={minimap.visibleY}
                            width={minimap.visibleWidth}
                            height={minimap.visibleHeight}
                            fill={MINIMAP_VISIBLE_FILL}
                            stroke={NONE}
                            rx={MINIMAP_VISIBLE_RADIUS}
                        />
                        {minimap.elements.map((element: MinimapElement) => (
                            <rect
                                key={element.id}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                transform={`rotate(${element.rotation}, ${element.x + element.width / 2}, ${element.y + element.height / 2})`}
                                fill={MINIMAL_ELEMENT_FILL}
                                stroke={NONE}
                                rx={MINIMAP_ELEMENT_RADIUS}
                            />
                        ))}
                    </svg>
                </div>
            )}
        </Island>
    );
};
