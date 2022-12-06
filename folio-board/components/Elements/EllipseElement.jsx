import React from "react";
import {getBalancedDash, getEllipsePerimeter} from "../../utils/index.js";
import {fillColors, strokeColors, strokeWidths} from "../../styles.js";

export const EllipseElement = props => {
    const rx = Math.abs(props.x2 - props.x1) / 2;
    const ry = Math.abs(props.y2 - props.y1) / 2;
    const strokeWidth = strokeWidths[props.strokeWidth];
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getEllipsePerimeter(rx, ry);
            return getBalancedDash(length, strokeWidth, props.strokeStyle);
        },
        [rx, ry, strokeWidth, props.strokeStyle],
    );
    return (
        <ellipse
            cx={Math.min(props.x1, props.x2) + rx}
            cy={Math.min(props.y1, props.y2) + ry}
            rx={rx}
            ry={ry}
            fill={fillColors[props.fillColor]}
            fillOpacity={props.fillOpacity}
            stroke={strokeColors[props.strokeColor]}
            strokeWidth={strokeWidth}
            strokeOpacity={props.strokeOpacity}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};
