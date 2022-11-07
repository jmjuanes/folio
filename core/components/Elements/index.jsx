import React from "react";

export const Elements = props => (
    <React.Fragment>
        {props.elements.map(element => {
            const {Component} = props.tools[element.type];

            return React.createElement(Component, {
                key: element.id,
                ...element,
            });
        })}
    </React.Fragment>
);

Elements.defaultProps = {
    tools: {},
    elements: [],
};
