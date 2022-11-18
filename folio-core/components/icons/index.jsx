import React from "react";

const SvgIcon = props => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <title>{props.title}</title>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            {props.children}
        </g>
    </svg>
);

export const RectangleToolIcon = () => (
    <SvgIcon title="Rectangle">
        <path d="M4 7C4 7 4 4 7 4L17 4C20 4 20 7 20 7L20 17C20 17 20 20 17 20L7 20C4 20 4 17 4 17L4 7Z" />
    </SvgIcon>
);

export const CircleToolIcon = () => (
    <SvgIcon title="Circle">
        <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" />
    </SvgIcon>
);

export const LineToolIcon = () => (
    <SvgIcon title="Line">
        <p d="M5 18L19 6" />
    </SvgIcon>
);

export const TextToolIcon = () => (
    <SvgIcon title="Text">
        <path d="M9 20L15 20M12 20L12 4M5 7L5 6C5 6 5 4 7 4L17 4C19 4 19 6 19 6L19 7" />
    </SvgIcon>
);

export const PenToolIcon = () => (
    <SvgIcon title="Pen">
        <path d="M5 15L4 20L9 19L20 8C21 7 20 6 20 6L18 4C18 4 17 3 16 4L5 15ZM15 5L13 3L8 8M19 5L20 4" />
    </SvgIcon>
);
