import React from "react";
import {
    TRANSPARENT,
    NONE,
    BOOKMARK_WIDTH,
    BOOKMARK_HEIGHT,
    BOOKMARK_OFFSET,
} from "../../lib/constants.js";
import {useAssets} from "../../contexts/assets.jsx";

export const BookmarkElement = props => {
    const assets = useAssets();
    const link = assets[props.assetId]?.data || {};
    const width = props.x2 - props.x1;
    const height = props.y2 - props.y1;
    const style = {
        // top: BOOKMARK_OFFSET + "px",
        // left: BOOKMARK_OFFSET + "px",
        height: height + "px",
        width: width + "px",
        transform: `translateX(${BOOKMARK_OFFSET}px) translateY(${BOOKMARK_OFFSET}px)`,
        pointerEvents: "none",
    };
    return (
        <g opacity={props.opacity}>
            <foreignObject
                x={props.x1 - BOOKMARK_OFFSET}
                y={props.y1 - BOOKMARK_OFFSET}
                width={width + (2 * BOOKMARK_OFFSET)}
                height={height + (2 * BOOKMARK_OFFSET)}
            >
                <div className="rounded-md bg-white shadow-sm" style={style}>
                    {link.src}
                </div>
            </foreignObject>
            <rect
                data-element={props.id}
                x={props.x1}
                y={props.y1}
                width={Math.max(1, width)}
                height={Math.max(1, height)}
                rx="0"
                fill={TRANSPARENT}
                stroke={NONE}
                onPointerDown={props.onPointerDown}
            />
        </g>
    );
};
