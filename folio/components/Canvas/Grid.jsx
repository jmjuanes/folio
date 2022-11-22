import React from "react";

export const Grid = props => (
    <g transform={`translate(${- props.size / 2} ${- props.size / 2})`}>
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
            width={props.width + props.size / 2}
            height={props.height + props.size / 2}
            fill="url(#grid)"
        />
    </g>
);

Grid.defaultProps = {
    id: "grid-pattern",
    width: 0,
    height: 0,
    zoom: 1,
    size: 20,
    fillColor: "rgb(66,72,82)",
    fillOpacity: 1,
};
