import React from "react";
import classNames from "classnames";
import {Island} from "../island.jsx";
import {useScene} from "../../contexts/scene.jsx";
import {getRectangleBounds} from "../../utils/math.js";

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 100;

const useMinimap = isVisible => {
    const scene = useScene();
    return React.useMemo(() => {
        const minimap = {
            width: MINIMAP_WIDTH,
            height: MINIMAP_HEIGHT,
            elements: [],
        };
        if (isVisible && scene.page.elements.length > 0) {
            const bounds = getRectangleBounds(scene.page.elements);
            // calculate the start and end points for the minimap
            const x1 = Math.min(bounds.x1, scene.page.translateX);
            const y1 = Math.min(bounds.y1, scene.page.translateY);
            const x2 = Math.max(bounds.x2, scene.page.translateX + scene.width);
            const y2 = Math.max(bounds.y2, scene.page.translateY + scene.height);
            const width = x2 - x1, height = y2 - y1;
            // calculate the scale factor for the minimap
            const ratio = width > height ? (MINIMAP_WIDTH / width) : (MINIMAP_HEIGHT / height);
            // calculate the position of all elements in the minimap
            minimap.elements = scene.page.elements.map(element => ({
                id: element.id,
                x1: (element.x1 - x1) * ratio,
                y1: (element.y1 - y1) * ratio,
                x2: (element.x2 - x1) * ratio,
                y2: (element.y2 - y1) * ratio,
            }));
            minimap.width = width * ratio; // update the width of the minimap
            minimap.visibleX = (scene.page.translateX - x1) * ratio; // update the visible x position
            minimap.visibleY = (scene.page.translateY - y1) * ratio; // update the visible y position
            minimap.visibleWidth = scene.width * ratio; // update the visible width
            minimap.visibleHeight = scene.height * ratio; // update the visible height
        }
        return minimap;
    }, [isVisible, scene.updatedAt, scene.page.id, scene.width, scene.height, scene.page.translateX, scene.page.translateY]);
};

// @public mini map panel component
export const MinimapPanel = () => {
    const [visible, setVisible] = React.useState(false);
    const minimap = useMinimap(visible);
    const panelClass = classNames("flex-col", {
        "w-48": !!visible,
    });
    return (
        <Island className={panelClass}>
            <div className="flex items-center justify-between gap-1">
                <div className="text-sm font-medium px-1">Minimap</div>
                <Island.Button
                    icon={!visible ? "arrow-up-right" : "arrow-down-left"} 
                    onClick={() => setVisible(!visible)}
                />
            </div>
            {visible && (
                <div className="flex items-center justify-center bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                    <svg width={minimap.width} height={minimap.height}>
                        {minimap.elements.map(element => (
                            <rect
                                key={element.id}
                                x={element.x1}
                                y={element.y1}
                                width={element.x2 - element.x1}
                                height={element.y2 - element.y1}
                                fill="transparent"
                                stroke="black"
                                strokeWidth="0.5"
                            />
                        ))}
                        {minimap.elements.length > 0 && (
                            <rect
                                x={minimap.visibleX}
                                y={minimap.visibleY}
                                width={minimap.visibleWidth}
                                height={minimap.visibleHeight}
                                fill="transparent"
                                stroke="black"
                                strokeWidth="1"
                            />
                        )}
                    </svg>
                </div>
            )}
        </Island>
    );
};
