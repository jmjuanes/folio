import React from "react";

const SvgIcon = props => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <title>{props.title}</title>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            {props.children}
        </g>
    </svg>
);

const createIcon = content => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        {content}
    </svg>
);

const createPathIcon = path => createIcon((
    <path d={path} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
));

export const ArrowsIcon = () => createPathIcon("M12 4L12 20M4 12L20 12M9 6L12 3L15 6M9 18L12 21L15 18M6 9L3 12L6 15M18 9L21 12L18 15");
export const PointerIcon = () => createPathIcon("M10.171 19.994L4.70338 3.99774L19.2831 12.3434L12.208 13.1532L10.171 19.994Z");
export const UndoIcon = () => createPathIcon("M9 16L17 16C17 16 21 16 21 12C21 8 17 8 17 8L4 8M7 11L3 8L7 5");
export const RedoIcon = () => createPathIcon("M15 16L7 16C7 16 3 16 3 12C3 8 7 8 7 8L20 8M17 5L21 8L17 11");
export const BanIcon = () => createPathIcon("M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12ZM6 6L18 18");

export const ZoomInIcon = () => createPathIcon(
    "M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11ZM16 16L20 20M8 11L14 11M11 8L11 14"
);
export const ZoomOutIcon = () => createPathIcon(
    "M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11ZM16 16L20 20M8 11L14 11"
);

// LINE_END_ARROW: svg("M15 7L21 12L15 17M3 12L21 12"),
// LINE_END_CIRCLE: svg("M15 12C15 10.3431 16.3431 9 18 9C19.6569 9 21 10.3431 21 12C21 13.6569 19.6569 15 18 15C16.3431 15 15 13.6569 15 12ZM3 12L15 12"),
// LINE_END_SQUARE: svg("M15 9L15 15L21 15L21 9L15 9ZM3 12L15 12"),
// LINE_START_ARROW: svg("M9 7L3 12L9 17M3 12L21 12"),
// LINE_START_CIRCLE: svg("M3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12ZM9 12L21 12"),
// LINE_START_SQUARE: svg("M3 9L9 9L9 15L3 15L3 9ZM9 12L21 12"),
//
//
// FULLSCREEN: svg("M10 4L7 4C4 4 4 7 4 7L4 10M14 4L17 4C20 4 20 7 20 7L20 10M14 20L17 20C20 20 20 17 20 17L20 14M10 20L7 20C4 20 4 17 4 17L4 14"),
// FULLSCREEN_EXIT: svg("M4 10L7 10C10 10 10 7 10 7L10 4M4 14L7 14C10 14 10 17 10 17L10 20M20 14L17 14C14 14 14 17 14 17L14 20M20 10L17 10C14 10 14 7 14 7L14 4"),
//
// TEXT_LEFT: svg("M4 6L20 6M4 10L12 10M4 14L20 14M4 18L12 18"),
// TEXT_RIGHT: svg("M4 6L20 6M12 10L20 10M4 14L20 14M12 18L20 18"),
// TEXT_CENTER: svg("M4 6L20 6M8 10L16 10M4 14L20 14M8 18L16 18"),

export const OpacityNoneIcon = () => {
    return createPathIcon("M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12ZM12 3L3 12M21 12L12 21M16 5L5 16M19 8L8 19");
};
export const OpacitySemiTransparentIcon = () => {
    return createPathIcon("M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12ZM12 3L12 21M12 3L3 12M12 9L5 16M12 15L8 19");
};
export const OpacityTransparentIcon = () => {
    return createPathIcon("M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z");
};

export const CircleSolidIcon = () => {
    return createIcon(<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />);
};
export const CircleDashedIcon = () => {
    return createIcon(<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5" />);
};
export const CircleDottedIcon = () => {
    return createIcon(<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="1.25 5" strokeLinecap="round" />);
};

export const EditIcon = () => createPathIcon("M13 20L20 20M5 16L4 20L8 19L19 8C19 8 20.4025 6.42587 19 5C17.5975 3.57413 16 5 16 5L5 16ZM14 7L17 10");
export const FillIcon = () => createPathIcon("M13 5L5 13C4 14 4 16 5 17L8 20C9 21 11 21 12 20L20 12L13 5ZM13 5L12 4C12 4 10 2 8 4C6 6 8 8 8 8L9 9M5 14L18 14M20 17L20 19C20 18 20 17 20 17Z");
export const CornersIcon = () => createPathIcon("M10 4L7 4C4 4 4 7 4 7L4 10M14 4L17 4C20 4 20 7 20 7L20 10M14 20L17 20C20 20 20 17 20 17L20 14M10 20L7 20C4 20 4 17 4 17L4 14");
export const ObjectGroupIcon = () => createPathIcon("M3 7L3 6C3 6 3 4 5 4L6 4M3 17L3 18C3 18 3 20 5 20L6 20M21 7L21 6C21 6 21 4 19 4L18 4M21 17L21 18C21 18 21 20 19 20L18 20M7 12C7 12 7 13 8 13L13 13C14 13 14 12 14 12L14 9C14 9 14 8 13 8L8 8C7 8 7 9 7 9L7 12ZM10 13L10 15C10 15 10 16 11 16L16 16C17 16 17 15 17 15L17 12C17 12 17 11 16 11L14 11");
export const ObjectUngroupIcon = () => createPathIcon("M5 6C4 6 4 7 4 7L4 10C4 10 4 11 5 11L10 11C11 11 11 10 11 10L11 7C11 7 11 6 10 6L5 6ZM14 14C13 14 13 15 13 15L13 18C13 18 13 19 14 19L19 19C20 19 20 18 20 18L20 15C20 15 20 14 19 14L14 14Z");
export const CropIcon = () => createPathIcon("M7 4L7 15C7 15 7 17 9 17L20 17M17 20L17 9C17 9 17 7 15 7L4 7");
export const TextIcon = () => createPathIcon("M9 20L15 20M12 20L12 4M5 7L5 6C5 6 5 4 7 4L17 4C19 4 19 6 19 6L19 7");
export const StrokeIcon = () => {
    return createIcon(<path fill="currentColor" stroke="none" d="M 2,2 H 22 V 4 H 2 Z m 0,7 h 20 v 3 H 2 Z m 20,8 H 2 v 5 h 20 z" />);
};

export const SaveIcon = () => createPathIcon("M4 6C4 6 4 4 6 4L16 4L20 8L20 18C20 18 20 20 18 20L6 20C4 20 4 18 4 18L4 6ZM15 4L15 8C15 8 15 9 14 9L9 9C8 9 8 8 8 8L8 4M10.5 14.5C10.5 13.6716 11.1716 13 12 13C12.8284 13 13.5 13.6716 13.5 14.5C13.5 15.3284 12.8284 16 12 16C11.1716 16 10.5 15.3284 10.5 14.5Z");
export const TrashIcon = () => createPathIcon("M6 6L6 18C6 18 6 21 9 21L15 21C18 21 18 18 18 18L18 6M4 6L20 6M8 6L9 3L15 3L16 6M10 10L10 17M14 10L14 17");
export const CameraIcon = () => {
    return createPathIcon("M9.5 12.5C9.5 11.1193 10.6193 10 12 10C13.3807 10 14.5 11.1193 14.5 12.5C14.5 13.8807 13.3807 15 12 15C10.6193 15 9.5 13.8807 9.5 12.5ZM3 16C3 16 3 19 6 19L18 19C21 19 21 16 21 16L21 9C21 9 21 7 19 7L17 7C16 7 15 5 14 5L10 5C9 5 8 7 7 7L5 7C3 7 3 9 3 9L3 16Z");
};

// SLIDERS: svg("M14 5C14 3.89543 14.8954 3 16 3C17.1046 3 18 3.89543 18 5C18 6.10457 17.1046 7 16 7C14.8954 7 14 6.10457 14 5ZM6 12C6 10.8954 6.89543 10 8 10C9.10457 10 10 10.8954 10 12C10 13.1046 9.10457 14 8 14C6.89543 14 6 13.1046 6 12ZM14 19C14 17.8954 14.8954 17 16 17C17.1046 17 18 17.8954 18 19C18 20.1046 17.1046 21 16 21C14.8954 21 14 20.1046 14 19ZM3 5L14 5M10 12L21 12M3 19L14 19M18 5L21 5M18 19L21 19M3 12L6 12"),
// SHARE: svg("M20 4L13 21L10 14L3 11L20 4ZM10 14L19 5"),
// FOLDER: svg("M6 5C3 5 3 8 3 8L3 16C3 16 3 19 6 19L18 19C21 19 21 16 21 16L21 10C21 10 21 8 19 8L13 8L10 5L6 5Z"),
export const DownloadIcon = () => createPathIcon("M4 15L4 17C4 17 4 20 7 20L17 20C20 20 20 17 20 17L20 15M12 4L12 15M9 13L12 16L15 13");
export const UploadIcon = () => createPathIcon("M4 15L4 17C4 17 4 20 7 20L17 20C20 20 20 17 20 17L20 15M12 16L12 5M9 7L12 4L15 7");

// export const ChevronUpIcon = () => createPathIcon("M6 15L12 9L18 15");
// export const ChevronDownIcon = () => createPathIcon("M6 9L12 15L18 9");

export const RectangleIcon = () => (
    <SvgIcon title="Rectangle">
        <path d="M4 7C4 7 4 4 7 4L17 4C20 4 20 7 20 7L20 17C20 17 20 20 17 20L7 20C4 20 4 17 4 17L4 7Z" />
    </SvgIcon>
);

export const CircleIcon = () => (
    <SvgIcon title="Circle">
        <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" />
    </SvgIcon>
);

export const LineIcon = () => (
    <SvgIcon title="Line">
        <path d="M5 18L19 6" />
    </SvgIcon>
);

export const TextIcon = () => (
    <SvgIcon title="Text">
        <path d="M9 20L15 20M12 20L12 4M5 7L5 6C5 6 5 4 7 4L17 4C19 4 19 6 19 6L19 7" />
    </SvgIcon>
);

export const PenIcon = () => (
    <SvgIcon title="Pen">
        <path d="M5 15L4 20L9 19L20 8C21 7 20 6 20 6L18 4C18 4 17 3 16 4L5 15ZM15 5L13 3L8 8M19 5L20 4" />
    </SvgIcon>
);

export const ShapesIcon = () => (
    <SvgIcon title="Shapes">
        <path d="M3 14L3 21L10 21L10 14L3 14ZM14 17.5C14 15.567 15.567 14 17.5 14C19.433 14 21 15.567 21 17.5C21 19.433 19.433 21 17.5 21C15.567 21 14 19.433 14 17.5ZM12 3L8.5 10L15.5 10L12 3Z" />
    </SvgIcon>
);
