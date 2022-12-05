import React from "react";
import {getBalancedDash, getPointsDistance} from "../../utils/index.js";

const LineRenderer = props => {
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            // const strokeWidth = parseInt(props.strokeWidth.replace("px", ""));
            // const length = getPointsDistance([props.x, props.y], [props.x2, props.y2]);
            // if (!isNaN(strokeWidth) && strokeWidth > 0) {
            //     if (props.strokeStyle === "dashed" || props.strokeStyle === "dotted") {
            //         return getBalancedDash(length, strokeWidth, props.strokeStyle);
            //     }
            // }
            return ["none", "none"];
        },
        // [props.strokeStyle, props.strokeWidth, props.x, props.y, props.x2, props.y2],
        [],
    );
    return (
        <line
            x1={props.x1}
            y1={props.y1}
            x2={props.x2}
            y2={props.y2}
            fill="none"
            stroke="#000"
            strokeWidth="2px"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};
