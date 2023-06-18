import React from "react";

export const SvgContainer = props => (
    <svg width={props.width} height={props.height} style={props.style}>
        {props.children}
    </svg>
);

SvgContainer.defaultProps = {
    width: "1",
    height: "1",
    style: {
        position: "absolute",
        overflow: "visible",
    },
};
