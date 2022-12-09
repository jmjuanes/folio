import React from "react";
import {DASH_KEYS, ARROWHEADS} from "../../constants.js";
import {getBalancedDash, getPointsDistance} from "../../utils/index.js";
import {strokeColors, strokeWidths} from "../../styles.js";

export const ArrowElement = props => {
    const strokeWidth = strokeWidths[props.strokeWidth];
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getPointsDistance([props.x, props.y], [props.x2, props.y2]);
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === DASH_KEYS.DASHED || strokeStyle === DASH_KEYS.DOTTED) {
                return getBalancedDash(length, strokeWidth, strokeStyle);
            }
            return ["none", "none"];
        },
        [strokeWidth, props.strokeStyle, props.x, props.y, props.x2, props.y2],
    );
    return (
        <React.Fragment>
            <line
                data-element={props.id}
                x1={props.x1}
                y1={props.y1}
                x2={props.x2}
                y2={props.y2}
                fill="none"
                stroke={strokeColors[props.strokeColor]}
                strokeWidth={strokeWidth}
                strokeOpacity={props.strokeOpacity}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeLinejoin="round"
                onPointerDown={props.onPointerDown}
            />
        </React.Fragment>
    );
};
