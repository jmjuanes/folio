import React from "react";

const SvgIcon = props => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            {props.children}
        </g>
    </svg>
);

export const ArrowConnectorIcon = () => (
    <SvgIcon title="Arrow Connector">
        <path d="m 18,4 3,3 -3,3 M 3,19 h 6 c 3,0 3,-3 3,-3 v -6 c 0,0 0,-3 3,-3 h 5 v 0 0" />
    </SvgIcon>
);

export const ArrowIcon = () => (
    <SvgIcon title="Arrow">
        <path d="M6 18L18 6M18 15L18 6L9 6" />
    </SvgIcon>
);

export const ArrowheadNoneIcon = () => (
    <SvgIcon title="None">
        <path d="M3 12L21 12" />
    </SvgIcon>
);

export const ArrowheadArrowIcon = () => (
    <SvgIcon title="Arrow">
        <path d="M3 12L21 12M13 4L21 12L13 20" />
    </SvgIcon>
);

export const ArrowheadTriangleIcon = () => (
    <SvgIcon title="Triangle">
        <path d="M3 12L12 12M21 12L12 5L12 19L21 12Z" />
    </SvgIcon>
);

export const ArrowheadSquareIcon = () => (
    <SvgIcon title="Square">
        <path d="M3 12L8 12M8 5L8 19L21 19L21 5L8 5Z" />
    </SvgIcon>
);

export const ArrowheadCircleIcon = () => (
    <SvgIcon title="Circle">
        <path d="M3 12L7 12M7 12C7 8.13401 10.134 5 14 5C17.866 5 21 8.13401 21 12C21 15.866 17.866 19 14 19C10.134 19 7 15.866 7 12Z" />
    </SvgIcon>
);

export const ArrowheadSegmentIcon = () => (
    <SvgIcon title="Segment">
        <path d="M3 12L21 12M21 5L21 19" />
    </SvgIcon>
);

export const CircleSolidIcon = () => (
    <SvgIcon title="CircleSolid">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
);

export const CircleDashedIcon = () => (
    <SvgIcon title="CircleDashed">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5" />
    </SvgIcon>
);

export const CircleDottedIcon = () => (
    <SvgIcon title="CircleDotted">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="1.25 5" strokeLinecap="round" />
    </SvgIcon>
);

export const CircleSemiFillIcon = () => (
    <SvgIcon title="CircleSolidFill">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path fill="currentColor" d="M2 12C2 9.25291 3.1077 6.76454 4.9008 4.95718L18.4603 19.6334C16.7177 21.1097 14.4628 22 12 22C6.47715 22 2 17.5228 2 12Z" />
    </SvgIcon>
);

export const CircleSolidFillIcon = () => (
    <SvgIcon title="CircleSolidFill">
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
);

export const CircleHatchFillIcon = () => (
    <SvgIcon title="CircleHatchFill">
        <path d="M12 3L3 12M21 12L12 21M16 5L5 16M19 8L8 19" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
);

export const StrokeIcon = () => (
    <SvgIcon title="Stroke">
        <path fill="currentColor" stroke="none" d="M 2,2 H 22 V 4 H 2 Z m 0,7 h 20 v 3 H 2 Z m 20,8 H 2 v 5 h 20 z" />
    </SvgIcon>
);

export const WidthLargeIcon = () => (
    <SvgIcon title="WidthLarge">
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
);

export const WidthSmallIcon = () => (
    <SvgIcon title="WidthLarge">
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
);
