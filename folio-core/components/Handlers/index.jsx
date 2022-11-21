import React from "react";

import {HANDLERS_TYPES} from "../../constants.js";
import {useBoundaryPoints} from "../../hooks/useBoundaryPoints.js";

import {CornerHandlers} from "./CornerHandlers.jsx";
import {EdgeHandlers} from "./EdgeHandlers.jsx";
import {PointHandlers} from "./PointHandlers.jsx";

export const Handlers = props => {
    const selectedElements = props.elements.filter(el => !!el.selected);
    if (selectedElements.length !== 1) {
        return null;
    }
    const element = selectedElements[0];
    const handlerType = props.tools[element.type].handlers || HANDLERS_TYPES.NONE;
    const points = useBoundaryPoints(element);

    return (
        <React.Fragment>
            {handlerType === HANDLERS_TYPES.RECTANGLE && (
                <React.Fragment>
                    <EdgeHandlers
                        zoom={props.zoom}
                        points={points}
                    />
                    <CornerHandlers
                        zoom={props.zoom}
                        points={points}
                    />
                </React.Fragment>
            )}
            {handlerType === HANDLERS_TYPES.POINTS && (
                <PointHandlers
                    zoom={props.zoom}
                    points={points}
                />
            )}
        </React.Fragment>
    );
};

Handlers.defaultProps = {
    tools: {},
    elements: [],
    zoom: 1,
};
