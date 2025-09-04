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
import {Island} from "./ui/island.jsx";
import {useEditor} from "../contexts/editor.jsx";
import {getRectangleBounds} from "../utils/math.js";

export type MinimapProps = {
    width?: number,
    height?: number,
};

// @description minimap panel component
export const Minimap = ({ width = MINIMAP_WIDTH, height = MINIMAP_HEIGHT }: MinimapProps): React.JSX.Element => {
    const editor = useEditor();
    // TODO: handle if minimap is not visible

    const minimap = React.useMemo(() => {
        if (!editor.width || !editor.height) {
            return null;
        }
        const bounds = editor.page.elements.length > 0 ? getRectangleBounds(editor.page.elements) : {} as any;
        // calculate the start and end points for the minimap
        const x1 = Math.min(bounds.x1 ?? Infinity, (-1) * editor.page.translateX / editor.page.zoom);
        const y1 = Math.min(bounds.y1 ?? Infinity, (-1) * editor.page.translateY / editor.page.zoom);
        const x2 = Math.max(bounds.x2 ?? -Infinity, ((-1) * editor.page.translateX + editor.width) / editor.page.zoom);
        const y2 = Math.max(bounds.y2 ?? -Infinity, ((-1) * editor.page.translateY + editor.height) / editor.page.zoom);
        // calculate the scale factor for the minimap
        const ratio = Math.min(width / Math.max(1, x2 - x1), height / Math.max(1, y2 - y1));
        return {
            width: Math.min(width, (x2 - x1) * ratio),
            height: Math.min(height, (y2 - y1) * ratio),
            // ratio: ratio,
            elements: editor.page.elements.map(element => ({
                id: element.id,
                x1: (Math.min(element.x1, element.x2) - x1) * ratio,
                y1: (Math.min(element.y1, element.y2) - y1) * ratio,
                x2: (Math.max(element.x1, element.x2) - x1) * ratio,
                y2: (Math.max(element.y1, element.y2) - y1) * ratio,
            })),
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
                        {minimap.elements.map(element => (
                            <rect
                                key={element.id}
                                x={element.x1}
                                y={element.y1}
                                width={element.x2 - element.x1}
                                height={element.y2 - element.y1}
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
