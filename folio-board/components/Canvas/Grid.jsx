import React from "react";
import {GRID_SIZE} from "../../constants.js";

export const Grid = props => {
    const x = (props.translateX - (props.translateX % props.size)) / props.zoom;
    const y = (props.translateY - (props.translateY % props.size)) / props.zoom;
    const transform = [
        // `scale(${1 / props.zoom},${1 / props.zoom})`,
        `translate(${- props.size / 2} ${- props.size / 2})`
    ];
    return (
        <g transform={`translate(${-x} ${-y})`}>
            <defs>
                <pattern
                    id="grid"
                    width={props.size}
                    height={props.size}
                    patternUnits="userSpaceOnUse"
                >
                    <circle
                        cx={props.size / 2}
                        cy={props.size / 2}
                        r={1 / props.zoom}
                        fill={props.fillColor}
                        fillOpacity={props.fillOpacity}
                    />
                </pattern>
            </defs>
            <rect
                x="0"
                y="0"
                width={(props.width / props.zoom) + (props.size / 2)}
                height={(props.height / props.zoom) + (props.size / 2)}
                fill="url(#grid)"
            />
        </g>
    );
};

Grid.defaultProps = {
    id: "grid-pattern",
    width: 0,
    height: 0,
    translateX: 0,
    translateY: 0,
    zoom: 1,
    size: GRID_SIZE,
    fillColor: "rgb(66,72,82)",
    fillOpacity: 1,
};
