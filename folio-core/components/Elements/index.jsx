import React from "react";
import {POINT_SOURCES} from "../../constants.js";

export const Elements = props => (
    <React.Fragment>
        {props.elements.map(element => {
            const {Component} = props.tools[element.type];

            return React.createElement(Component, {
                key: element.id,
                elementAttributes: {
                    "data-type": POINT_SOURCES.ELEMENT,
                    "data-value": element.id,
                },
                ...element,
            });
        })}
    </React.Fragment>
);

Elements.defaultProps = {
    tools: {},
    elements: [],
};
