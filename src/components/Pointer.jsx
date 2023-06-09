import React from "react";
import {WHITE, BLACK} from "../constants";

export const Pointer = props => (
    <ellipse
        cx={props.position.x}
        cy={props.position.y}
        rx={props.radius}
        ry={props.radius}
        fill={props.fillColor}
        fillOpacity={props.fillOpacity}
        stroke={props.strokeColor}
        strokeWidth={props.strokeWidth}
        strokeOpacity={props.strokeOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
    />
);

Pointer.defaultProps = {
    position: null,
    radius: 5,
    fillColor: WHITE,
    fillOpacity: 1.0,
    strokeColor: BLACK,
    strokeWidth: 1,
    strokeOpacity: 0.2,
};
