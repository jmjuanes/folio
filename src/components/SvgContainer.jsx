import React from "react";

export const SvgContainer = props => (
    <svg width={props.width} height={props.height} style={props.style}>
        {props.children}
    </svg>
);

SvgContainer.defaultProps = {
    width: "1px",
    height: "1px",
    style: {
        position: "absolute",
        overflow: "visible",
        top: "-1px",
        left: "-1px",
    },
};
