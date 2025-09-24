import React from "react";
import { useAssets } from "../../contexts/assets.jsx";

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
    const assets = useAssets() as any;
    const dataUrl = assets[props.assetId]?.data?.src || "";

    return (
        <g opacity={props.opacity}>
            <image
                data-element={props.id}
                x={Math.min(props.x1, props.x2)}
                y={Math.min(props.y1, props.y2)}
                width={Math.abs(props.x2 - props.x1)}
                height={Math.abs(props.y2 - props.y1)}
                href={dataUrl}
                preserveAspectRatio="none"
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
