import React from "react";
import {DASH_KEYS} from "../../constants.js";
import {getBalancedDash, getEllipsePerimeter} from "../../utils/index.js";
import {fillColors, strokeColors, strokeWidths} from "../../styles.js";

export const EllipseElement = props => {
    const rx = Math.abs(props.x2 - props.x1) / 2;
    const ry = Math.abs(props.y2 - props.y1) / 2;
    const strokeWidth = strokeWidths[props.strokeWidth];
    const [strokeDasharray, strokeDashoffset] = React.useMemo(
        () => {
            const length = getEllipsePerimeter(rx, ry);
            const strokeStyle = props.strokeStyle;
            if (strokeStyle === DASH_KEYS.DASHED || strokeStyle === DASH_KEYS.DOTTED) {
                return getBalancedDash(length, strokeWidth, strokeStyle);
            }
            return ["none", "none"];
        },
        [rx, ry, strokeWidth, props.strokeStyle],
    );
    return (
        <ellipse
            data-element={props.id}
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
            onPointerDown={props.onPointerDown}
            onDoubleClick={props.onDoubleClick}
        />
    );
};
