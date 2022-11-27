import React from "react";
import {boundaryPoints} from "../../utils/index.js";

export const Bounds = props => {
    const offset = props.offset / props.zoom;
    // const selectedElements = props.elements.filter(el => !!el.selected);
    let points = [];
    // let path = null;
    if (props.elements.length > 1) {
        const allPoints = props.elements.map(el => el.points);
        points = boundaryPoints(allPoints.flat(1));
        // path = "M" + points.map(p => "L" + p.join(",")).join("").slice(1) + "Z";
    }

    return (
        <React.Fragment>
            {points.length > 2 && (
                <rect
                    x={points[0][0] - offset}
                    y={points[0][1] - offset}
                    width={Math.abs(points[3][0] - points[0][0]) + 2 * offset}
                    height={Math.abs(points[1][1] - points[0][1]) + 2 * offset}
                    fill={props.fillColor}
                    stroke={props.strokeColor}
                    strokeWidth={props.strokeWidth / props.zoom}
                    onPointerDown={props.onPointerDown}
                />
            )}
        </React.Fragment>
    );
};

Bounds.defaultProps = {
    elements: [],
    offset: 4,
    fillColor: "transparent",
    fillOpacity: "0.2",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    zoom: 1,
    onPointerDown: null,
};
