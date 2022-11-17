import React from "react";
import {POINT_SOURCES} from "../../constants.js";

export const Elements = props => (
    <React.Fragment>
        {props.elements.map(element => {
            const {Component} = props.tools[element.type];
            const attributes = {
                "data-type": POINT_SOURCES.ELEMENT,
                "data-value": element.id,
            };

            return (
                <g key={element.id} data-element-id={element.id}>
                    <Component
                        elementAttributes={attributes}
                        {...element}
                    />
                </g>
            );
        })}
    </React.Fragment>
);

Elements.defaultProps = {
    tools: {},
    elements: [],
};
