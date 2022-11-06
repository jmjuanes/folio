import React from "react";

import {HANDLERS_TYPES} from "../../constants.js";
import {CornerHandlers} from "./CornerHandlers.jsx";
import {EdgeHandlers} from "./EdgeHandlers.jsx";

export const Handlers = props => {
    const selectedElements = props.elements.filter(el => !!el.selected);
    if (selectedElements.length !== 1) {
        return null;
    }
    const element = selectedElements[0];
    const handlerType = props.tools[element.type].handlers || HANDLERS_TYPES.NONE;
    const points = props.tools[element.type].getHandlersPoints(element);

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
    elements: [],
    handlerColor: "#4285f4",
    handlerSize: 5,
};
