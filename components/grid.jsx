import React from "react";
import {GRID_SIZE} from "@lib/constants.js";
import {SvgContainer} from "@components/commons/svg.jsx";

export const Grid = props => {
    const translateX = props.translateX / props.zoom;
    const translateY = props.translateY / props.zoom;
    const x= (translateX % props.size) - translateX - (props.size / 2);
    const y= (translateY % props.size) - translateY - (props.size / 2);
    return (
        <SvgContainer>
            <defs>
                <pattern id="grid" width={props.size} height={props.size} patternUnits="userSpaceOnUse">
                    <circle
                        cx={props.size / 2}
                        cy={props.size / 2}
                        r={1 / props.zoom}
                        fill={props.fillColor}
                        fillOpacity={props.fillOpacity}
                    />
                </pattern>
            </defs>
            <g transform={`translate(${x},${y})`}>
                <rect
                    width={(props.width + props.size) / props.zoom}
                    height={(props.height  + props.size) / props.zoom}
                    fill="url(#grid)"
                />
            </g>
        </SvgContainer>
    );
};

Grid.defaultProps = {
    width: 0,
    height: 0,
    translateX: 0,
    translateY: 0,
    zoom: 1,
    size: GRID_SIZE,
    fillColor: "rgb(66,72,82)",
    fillOpacity: 1,
};
