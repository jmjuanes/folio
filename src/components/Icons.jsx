import React from "react";

const SvgIcon = props => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            {props.children}
        </g>
    </svg>
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

export const BarsIcon = () => (
    <SvgIcon title="Bars">
        <path d="M4 6L20 6M4 12L20 12M4 18L20 18" />
    </SvgIcon>
);

export const CheckIcon = () => (
    <SvgIcon title="Check">
        <path d="M5 12L10 17L20 7" />
    </SvgIcon>
);

export const CheckSquareIcon = () => (
    <SvgIcon title="CheckSquare">
        <path d="M8 12.5L10.6667 15L16 10M6 4C4 4 4 6 4 6L4 18C4 18 4 20 6 20C9.53553 20 14.4645 20 18 20C20 20 20 18 20 18L20 6C20 6 20 4 18 4C14.4645 4 9.53553 4 6 4Z" />
    </SvgIcon>
);

export const CircleIcon = () => (
    <SvgIcon title="Circle">
        <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" />
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

export const ClipboardIcon = () => (
    <SvgIcon title="Clipboard">
        <path d="M9 5L7 5C5 5 5 7 5 7L5 19C5 19 5 21 7 21L17 21C19 21 19 19 19 19L19 7C19 7 19 5 17 5L15 5M11 3C11 3 9 3 9 5C9 7 11 7 11 7L13 7C13 7 15 7 15 5C15 3 13 3 13 3L11 3Z" />
    </SvgIcon>
);

export const CloseIcon = () => (
    <SvgIcon title="Close">
        <path d="M7 16.9L17 7M7 7L17 16.9" />
    </SvgIcon>
);

export const CodeIcon = () => (
    <SvgIcon title="Code">
        <path d="M14 5L10 19M7 8L3 12L7 16M17 8L21 12L17 16" />
    </SvgIcon>
);

export const DiamondIcon = () => (
    <SvgIcon title="Diamond">
        <path d="M12 21L3 12L12 3L21 12L12 21Z" />
    </SvgIcon>
);

export const DownloadIcon = () => (
    <SvgIcon title="Download">
        <path d="M4 15L4 17C4 17 4 20 7 20L17 20C20 20 20 17 20 17L20 15M12 4L12 15M9 13L12 16L15 13" />
    </SvgIcon>
);

export const DrawingIcon = () => (
    <SvgIcon title="Drawing">
        <path d="M13 21L18 21C18 21 20 21 20 19C20 17 18 17 18 17L6 17C6 17 4 17 4 15C4 13 6 13 6 13L7 13M10 13L10 10L17 3L20 6L13 13L10 13ZM15 5L18 8" />
    </SvgIcon>
);

export const DropletIcon = () => (
    <SvgIcon title="Droplet">
        <path d="M12 3C12 3 6 9 6 14C6 18 9 20 12 20C15 20 18 18 18 14C18 9 12 3 12 3ZM9 14C9 14 9 17 12 17" />
    </SvgIcon>
);

export const ExternalLinkIcon = () => (
    <SvgIcon title="ExternalLink">
        <path d="M10 4L7 4C4 4 4 7 4 7L4 17C4 17 4 20 7 20L17 20C20 20 20 17 20 17L20 14M14 4L20 4L20 10M8 16L20 4" />
    </SvgIcon>
);

export const EraseIcon = () => (
    <SvgIcon title="Erase">
        <path d="M20 20L8 20L5 17C4 16 3 14 5 12L12 5C14 3 16 4 17 5L19 7C20 8 21 10 19 12L11 20M9 9L15 15" />
    </SvgIcon>
);

export const FillIcon = () => (
    <SvgIcon title="Fill">
        <path d="M13 5L5 13C4 14 4 16 5 17L8 20C9 21 11 21 12 20L20 12L13 5ZM13 5L12 4C12 4 10 2 8 4C6 6 8 8 8 8L9 9M5 14L18 14M20 17L20 19C20 18 20 17 20 17Z" />
    </SvgIcon>
);

export const FolderIcon = () => (
    <SvgIcon title="Folder">
        <path d="M6 5C3 5 3 8 3 8L3 16C3 16 3 19 6 19L18 19C21 19 21 16 21 16L21 10C21 10 21 8 19 8L13 8L10 5L6 5Z" />
    </SvgIcon>
);

export const GridIcon = () => (
    <SvgIcon title="Grid">
        <path d="M4 5C4 5 4 4 5 4L9 4C10 4 10 5 10 5L10 9C10 9 10 10 9 10L5 10C4 10 4 9 4 9L4 5ZM4 15C4 15 4 14 5 14L9 14C10 14 10 15 10 15L10 19C10 19 10 20 9 20L5 20C4 20 4 19 4 19L4 15ZM14 15C14 15 14 14 15 14L19 14C20 14 20 15 20 15L20 19C20 19 20 20 19 20L15 20C14 20 14 19 14 19L14 15ZM14 5C14 5 14 4 15 4L19 4C20 4 20 5 20 5L20 9C20 9 20 10 19 10L15 10C14 10 14 9 14 9L14 5Z" />
    </SvgIcon>
);

export const HandGrabIcon = () => (
    <SvgIcon title="Hand Grab">
        <path d="M6 16C2 11 4 10 4 10C5.1767 9.21554 6 10 6 10L8 12L8 7C8 5 11 5 11 7L11 11L11 6C11 4 14 4 14 6L14 11L14 7C14 5 17 5 17 7L17 11L17 10C17 8 20 8 20 10L20 15C20 15 20 20 15 20L12 20C9 20 7.7669 18.2086 6 16Z" />
    </SvgIcon>
);

export const ImageIcon = () => (
    <SvgIcon title="Image">
        <path d="M7 4C4 4 4 7 4 7L4 17C4 17 4 20 7 20L17 20C20 20 20 17 20 17L20 7C20 7 20 4 17 4L7 4ZM4 17L8 14L11 16L16 12L20 15M8 9C8 8.44772 8.44772 8 9 8C9.55228 8 10 8.44772 10 9C10 9.55228 9.55228 10 9 10C8.44772 10 8 9.55228 8 9Z" />
    </SvgIcon>
);

export const LockIcon = () => (
    <SvgIcon title="Lock">
        <path d="M9 11L9 6C9 6 9 3 12 3C15 3 15 6 15 6L15 11M8 11C5 11 5 14 5 14L5 18C5 18 5 21 8 21L16 21C19 21 19 18 19 18L19 14C19 14 19 11 16 11L8 11ZM12 17L12 16" />
    </SvgIcon>
);

export const MenuIcon = () => (
    <SvgIcon title="Menu">
        <path d="M4 6L20 6M4 12L20 12M4 18L20 18" />
    </SvgIcon>
);

export const MinusIcon = () => (
    <SvgIcon title="Minus">
        <path d="M4 12L20 12" />
    </SvgIcon>
);

export const PenIcon = () => (
    <SvgIcon title="Pen">
        <path d="M5 15L4 20L9 19L20 8C21 7 20 6 20 6L18 4C18 4 17 3 16 4L5 15ZM15 5L13 3L8 8M19 5L20 4" />
    </SvgIcon>
);

export const PlusIcon = () => (
    <SvgIcon title="Plus">
        <path d="M12 4L12 20M4 12L20 12" />
    </SvgIcon>
);

export const PointerIcon = () => (
    <SvgIcon title="Pointer">
        <path d="M10.171 19.994L4.70338 3.99774L19.2831 12.3434L12.208 13.1532L10.171 19.994Z" />
    </SvgIcon>
);

export const RedoIcon = () => (
    <SvgIcon title="Redo">
        <path d="M15 16L7 16C7 16 3 16 3 12C3 8 7 8 7 8L20 8M17 5L21 8L17 11" />
    </SvgIcon>
);

export const ShapesIcon = () => (
    <SvgIcon title="Shapes">
        <path d="M3 14L3 21L10 21L10 14L3 14ZM14 17.5C14 15.567 15.567 14 17.5 14C19.433 14 21 15.567 21 17.5C21 19.433 19.433 21 17.5 21C15.567 21 14 19.433 14 17.5ZM12 3L8.5 10L15.5 10L12 3Z" />
    </SvgIcon>
);

export const SquareIcon = () => (
    <SvgIcon title="Square">
        <path d="M4 7C4 7 4 4 7 4L17 4C20 4 20 7 20 7L20 17C20 17 20 20 17 20L7 20C4 20 4 17 4 17L4 7Z" />
    </SvgIcon>
);

export const StrokeIcon = () => (
    <SvgIcon title="Stroke">
        <path fill="currentColor" stroke="none" d="M 2,2 H 22 V 4 H 2 Z m 0,7 h 20 v 3 H 2 Z m 20,8 H 2 v 5 h 20 z" />
    </SvgIcon>
);

export const SunIcon = () => (
    <SvgIcon title="Sun">
        <path d="M8 12C8 9.79086 9.79086 8 12 8C12.9832 8 13.8835 8.35471 14.58 8.94315C15.4485 9.67689 16 10.774 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12ZM12 3L12 4M12 20L12 21M3 12L4 12M20 12L21 12M18.4003 5.67259L17.6892 6.37564M6.31084 17.6244L5.59969 18.3274M5.67259 5.59969L6.37564 6.31084M17.6244 17.6892L18.3274 18.4003" />
    </SvgIcon>
);

export const TextIcon = () => (
    <SvgIcon title="Text">
        <path d="M9 20L15 20M12 20L12 4M5 7L5 6C5 6 5 4 7 4L17 4C19 4 19 6 19 6L19 7" />
    </SvgIcon>
);

export const TextCenterIcon = () => (
    <SvgIcon title="TextCenter">
        <path d="M4 6L20 6M8 10L16 10M4 14L20 14M8 18L16 18" />
    </SvgIcon>
);

export const TextJustifyIcon = () => (
    <SvgIcon title="TextJustify">
        <path d="M4 6L20 6M4 10L20 10M4 14L20 14M4 18L20 18" />
    </SvgIcon>
);

export const TextLeftIcon = () => (
    <SvgIcon title="TextLeft">
        <path d="M4 6L20 6M4 10L12 10M4 14L20 14M4 18L12 18" />
    </SvgIcon>
);

export const TextRightIcon = () => (
    <SvgIcon title="TextRight">
        <path d="M4 6L20 6M12 10L20 10M4 14L20 14M12 18L20 18" />
    </SvgIcon>
);

export const TrashIcon = () => (
    <SvgIcon title="Trash">
        <path d="M6 6L6 18C6 18 6 21 9 21L15 21C18 21 18 18 18 18L18 6M4 6L20 6M8 6L9 3L15 3L16 6M10 10L10 17M14 10L14 17" />
    </SvgIcon>
);

export const TriangleIcon = () => (
    <SvgIcon title="Triangle">
        <path d="M3 20L12 3L21 20L3 20Z" />
    </SvgIcon>
);

export const UndoIcon = () => (
    <SvgIcon title="Undo">
        <path d="M9 16L17 16C17 16 21 16 21 12C21 8 17 8 17 8L4 8M7 11L3 8L7 5" />
    </SvgIcon>
);

export const UnlockIcon = () => (
    <SvgIcon title="Unlock">
        <path d="M9 7L9 6C9 6 9 3 12 3C15 3 15 6 15 6L15 11M8 11C5 11 5 14 5 14L5 18C5 18 5 21 8 21L16 21C19 21 19 18 19 18L19 14C19 14 19 11 16 11L8 11ZM12 17L12 16" />
    </SvgIcon>
);

export const ZoomInIcon = () => (
    <SvgIcon title="ZoomIn">
        <path d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11ZM16 16L20 20M8 11L14 11M11 8L11 14" />
    </SvgIcon>
);

export const ZoomOutIcon = () => (
    <SvgIcon title="ZoomOut">
        <path d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11ZM16 16L20 20M8 11L14 11" />
    </SvgIcon>
);
