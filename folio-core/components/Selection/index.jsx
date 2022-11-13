import React from "react";
import {boundaryPoints} from "folio-math";
import {POINT_SOURCES} from "../../constants.js";

export const Selection = props => {
    const offset = props.offset / props.zoom;
    const selectedElements = props.elements.filter(el => !!el.selected);
    let points = [];
    let path = null;
    if (selectedElements.length > 1) {
        points = selectedElements
            .map(el => props.tools[el.type].getBoundaryPoints(el))
            .flat(1);
        
        // Check if selection is not a single line, so we will need to generate
        // the boundary rectangle
        if (points.length > 2) {
            points = boundaryPoints(points);
            // path = "M" + points.map(p => "L" + p.join(",")).join("").slice(1) + "Z";
        }
    }

    return (
        <React.Fragment>
            {points.length > 2 && (
                <rect
                    data-type={POINT_SOURCES.SELECTION}
                    x={points[0][0] - offset}
                    y={points[0][1] - offset}
                    width={Math.abs(points[3][0] - points[0][0]) + 2 * offset}
                    height={Math.abs(points[1][1] - points[0][1]) + 2 * offset}
                    fill={props.fillColor}
                    stroke={props.strokeColor}
                    strokeWidth={props.strokeWidth / props.zoom}
                />
            )}
        </React.Fragment>
    );
};

Selection.defaultProps = {
    tools: {},
    elements: [],
    offset: 4,
    fillColor: "transparent",
    fillOpacity: "0.2",
    strokeColor: "#0d6efd",
    strokeWidth: 2,
    zoom: 1,
};
