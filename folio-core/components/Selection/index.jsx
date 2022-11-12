import React from "react";
import {boundaryPoints} from "folio-math";
import {POINT_SOURCES} from "../../constants.js";

export const Selection = props => {
    const selectedElements = props.elements.filter(el => !!el.selected);
    let points = [];
    let path = null;
    if (selectedElements.length > 0) {
        points = selectedElements
            .map(el => props.tools[el.type].getBoundaryPoints(el))
            .flat(1);
        
        // Check if selection is not a single line, so we will need to generate
        // the boundary rectangle
        if (points.length > 2) {
            points = boundaryPoints(points);
            path = "M" + points.map(p => "L" + p.join(",")).join("").slice(1) + "Z";
        }
    }

    return (
        <React.Fragment>
            {points.length > 2 && (
                <path
                    data-type={POINT_SOURCES.SELECTION}
                    d={path}
                    fill={props.fillColor}
                    fillOpacity={props.fillOpacity}
                    stroke={props.strokeColor}
                    strokeWidth={props.strokeWidth}
                />
            )}
        </React.Fragment>
    );
};

Selection.defaultProps = {
    tools: {},
    elements: [],
    offset: 0,
    fillColor: "#4285f4",
    fillOpacity: "0.2",
    strokeColor: "#4285f4",
    strokeWidth: "2px",
};
