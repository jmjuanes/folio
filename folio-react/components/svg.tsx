import React from "react";

const defaultStyle: React.CSSProperties = {
    position: "absolute",
    overflow: "visible",
    top: "-1px",
    left: "-1px",
};

export type SvgContainerProps = {
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
};

export const SvgContainer = ({ width, height, style, children }: SvgContainerProps): React.JSX.Element => (
    <svg width={width ?? "1px"} height={height ?? "1px"} style={{...defaultStyle, ...style}}>
        {children}
    </svg>
);
