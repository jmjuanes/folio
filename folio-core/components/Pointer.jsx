import React from "react";
import {COLORS} from "../constants.js";

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
    fillColor: COLORS.WHITE,
    fillOpacity: 1.0,
    strokeColor: COLORS.GRAY,
    strokeWidth: 1,
    strokeOpacity: 0.3,
};
