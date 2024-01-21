import React from "react";
import {useAssets} from "@components/contexts/assets.jsx";

export const ImageElement = props => {
    const assets = useAssets();
    const dataUrl = assets[props.assetId]?.dataUrl || "";

    return (
        <g opacity={props.opacity}>
            <image
                data-element={props.id}
                x={Math.min(props.x1, props.x2)}
                y={Math.min(props.y1, props.y2)}
                width={Math.abs(props.x2 - props.x1)}
                height={Math.abs(props.y2 - props.y1)}
                href={dataUrl}
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};
