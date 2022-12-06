import React from "react";
import {getBalancedDash, getRectanglePerimeter} from "../../utils/index.js";
import {fillColors, strokeColors, strokeWidths} from "../../styles.js";

export const RectangleElement = props => {
    const width = Math.abs(props.x2 - props.x1);
    const height = Math.abs(props.y2 - props.y1);
    const strokeWidth = strokeWidths[props.strokeWidth];
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getRectanglePerimeter(width, height);
            return getBalancedDash(length, strokeWidth, props.strokeStyle);
            return ["none", "none"];
        },
        [width, height, strokeWidth, props.strokeStyle],
    );
    return (
        <rect
            x={Math.min(props.x1, props.x2)}
            y={Math.min(props.y1, props.y2)}
            width={Math.max(1, width)}
            height={Math.max(1, height)}
            rx="0"
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
