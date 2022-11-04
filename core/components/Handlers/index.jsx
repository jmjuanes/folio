import React from "react";

import {HANDLERS_TYPES} from "../../constants.js";

import {CornerHandlers} from "./CornerHandlers.jsx";
import {EdgeHandlers} from "./EdgeHandlers.jsx";

export const Handlers = props => {
    const element = props.elements[props.selectedElements[0]];
    const handlerType = props.tools[element.type].handlers || HANDLERS_TYPES.NONE;
    const points = props.tools[element.type].getBoundaryPoints(element);

    return (
        <React.Fragment>
            {handlerType === HANDLERS_TYPES.RECTANGLE && (
                <React.Fragment>
                    <EdgeHandlers
                        color={props.handlerColor}
                        points={points}
                    />
                    <CornerHandlers
                        color={props.handlerColor}
                        points={points}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

Handlers.defaultProps = {
    tools: {},
    elements: {},
    selectedElements: [],
    handlerColor: "#4285f4",
    handlerSize: 5,
};
