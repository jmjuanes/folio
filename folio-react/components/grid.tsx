import { GRID_SIZE } from "../constants.js";
import { SvgContainer } from "./svg.tsx";
import type { JSX } from "react";

export type GridProps = {
    width: number;
    height: number;
    translateX: number;
    translateY: number;
    zoom: number;
    size?: number;
    fillColor?: string;
    fillOpacity?: number;
};

export const Grid = (props: GridProps): JSX.Element => {
    const fillColor = props.fillColor ?? "rgb(66,72,82)";
    const fillOpacity = props.fillOpacity ?? 1;
    const size = props.size ?? GRID_SIZE;
    const calculatedTranslateX = props.translateX / props.zoom;
    const calculatedTranslateY = props.translateY / props.zoom;
    const x = (calculatedTranslateX % size) - calculatedTranslateX - (size / 2);
    const y = (calculatedTranslateY % size) - calculatedTranslateY - (size / 2);
    return (
        <SvgContainer>
            <defs>
                <pattern id="grid" width={size} height={size} patternUnits="userSpaceOnUse">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={1 / props.zoom}
                        fill={fillColor}
                        fillOpacity={fillOpacity}
                    />
                </pattern>
            </defs>
            <g transform={`translate(${x},${y})`}>
                <rect
                    width={(props.width + size) / props.zoom}
                    height={(props.height + size) / props.zoom}
                    fill="url(#grid)"
                />
            </g>
        </SvgContainer>
    );
};
