import React from "react";

const defaultStyle = {
    position: "absolute",
    overflow: "visible",
    top: "-1px",
    left: "-1px",
};

export const SvgContainer = ({width, height, style, children}) => (
    <svg width={width ?? "1px"} height={height ?? "1px"} style={{...defaultStyle, ...style}}>
        {children}
    </svg>
);
