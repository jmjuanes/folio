import React from "react";
import {
    NONE,
    MINIMAP_WIDTH,
    MINIMAP_HEIGHT,
    MINIMAP_VISIBLE_FILL,
    MINIMAP_VISIBLE_RADIUS,
    MINIMAL_ELEMENT_FILL,
    MINIMAP_ELEMENT_RADIUS,
} from "../../constants.js";
import {Island} from "../island.jsx";
import {useScene} from "../../contexts/scene.jsx";
import {getRectangleBounds} from "../../utils/math.js";

// @public mini map panel component
export const MinimapPanel = () => {
    const scene = useScene();
    const minimap = React.useMemo(() => {
        if (!scene.width || !scene.height) {
            return null;
        }
        const bounds = scene.page.elements.length > 0 ? getRectangleBounds(scene.page.elements) : {};
        // calculate the start and end points for the minimap
        const x1 = Math.min(bounds.x1 ?? Infinity, (-1) * scene.page.translateX);
        const y1 = Math.min(bounds.y1 ?? Infinity, (-1) * scene.page.translateY);
        const x2 = Math.max(bounds.x2 ?? 0, (-1) * scene.page.translateX + (scene.width / scene.page.zoom));
        const y2 = Math.max(bounds.y2 ?? 0, (-1) * scene.page.translateY + (scene.height / scene.page.zoom));
        const width = x2 - x1, height = y2 - y1;
        // calculate the scale factor for the minimap
        const ratio = Math.min(MINIMAP_WIDTH / width, MINIMAP_HEIGHT / height);
        return {
            width: Math.min(MINIMAP_WIDTH, width * ratio),
            height: Math.min(MINIMAP_HEIGHT, height * ratio),
            ratio: ratio,
            elements: scene.page.elements.map(element => ({
                id: element.id,
                x1: (Math.min(element.x1, element.x2) - x1) * ratio,
                y1: (Math.min(element.y1, element.y2) - y1) * ratio,
                x2: (Math.max(element.x1, element.x2) - x1) * ratio,
                y2: (Math.max(element.y1, element.y2) - y1) * ratio,
            })),
            visibleX: ((-1) * scene.page.translateX - x1) * ratio, // update the visible x position
            visibleY: ((-1) * scene.page.translateY - y1) * ratio, // update the visible y position
            visibleWidth: scene.width * ratio / scene.page.zoom, // update the visible width
            visibleHeight: scene.height * ratio / scene.page.zoom, // update the visible height
        };
    }, [scene.updatedAt, scene.page.id, scene.width, scene.height, scene.page.translateX, scene.page.translateY]);
    return (
        <Island className="w-48 items-center justify-center">
            <div className="flex items-center justify-center bg-white">
                {!!minimap && (
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
                )}
            </div>
        </Island>
    );
};
