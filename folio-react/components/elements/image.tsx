import React from "react";
import { useAssets } from "../../contexts/assets.jsx";
import { convertRadiansToDegrees, getCenter } from "../../utils/math.ts";
import { getElementSize } from "../../lib/elements.js";

export type ImageElementProps = {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    rotation?: number;
    assetId: string;
    opacity?: number;
    onPointerDown?: (event: React.PointerEvent<SVGImageElement>) => void;
    onDoubleClick?: (event: React.MouseEvent<SVGImageElement, MouseEvent>) => void;
};

export const ImageElement = (props: ImageElementProps): React.JSX.Element => {
    const [ width, height, x, y ] = getElementSize(props);
    const [ cx, cy ] = getCenter([ props.x1, props.y1 ], [ props.x2, props.y2 ]);
    const rotation = convertRadiansToDegrees(props.rotation || 0);
    const assets = useAssets() as any;
    const dataUrl = assets[props.assetId]?.data?.src || "";

    return (
        <g transform={`translate(${x},${y}) rotate(${rotation}, ${cx - x}, ${cy - y})`} opacity={props.opacity}>
            <image
                data-element={props.id}
                x={0}
                y={0}
                width={width}
                height={height}
                href={dataUrl}
                preserveAspectRatio="none"
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
