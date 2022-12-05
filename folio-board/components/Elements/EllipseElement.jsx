import React from "react";
import {getBalancedDash, getEllipsePerimeter} from "../../utils/index.js";

export const EllipseElement = props => {
    const rx = Math.abs(props.x2 - props.x1) / 2;
    const ry = Math.abs(props.y2 - props.y1) / 2;
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getEllipsePerimeter(rx, ry);
            // return getBalancedDash(length, props.strokeWidth, props.strokeStyle);
            return ["none", "none"];
        },
        [rx, ry, props.strokeWidth, props.strokeStyle],
    );
    return (
        <ellipse
            cx={Math.min(props.x1, props.x2) + rx}
            cy={Math.min(props.y1, props.y2) + ry}
            rx={rx}
            ry={ry}
            fill="transparent"
            stroke="#000"
            strokeWidth="2px"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};
