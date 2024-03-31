import React from "react";
import {
    TRANSPARENT,
    NONE,
    BOOKMARK_WIDTH,
    BOOKMARK_HEIGHT,
} from "../../lib/constants.js";
import {useAssets} from "../../contexts/assets.jsx";

export const BookmarkElement = props => {
    const assets = useAssets();
    const link = assets[props.assetId]?.data || {};
    const width = props.x2 - props.x1;
    const height = props.y2 - props.y1;
    return (
        <g opacity={props.opacity}>
            <foreignObject x={props.x1} y={props.y1} width={width} height={height}>
                <div className="overflow-hidden rounded-md bg-white shadow-sm" style={{width, height}}>
                    {link.src}
                </div>
            </foreignObject>
            <rect
                data-element={props.id}
                x={props.x1}
                y={props.y2}
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
