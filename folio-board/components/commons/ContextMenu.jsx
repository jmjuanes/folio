import React from "react";

export const ContextMenuItem = props => (
    <div className="d-flex items-center gap-2 r-md px-3 py-2 select-none bg-gray-200:hover cursor-pointer" onClick={props.onClick}>
        <div className="d-flex items-center text-sm text-gray-700">
            <span>{props.text}</span>
        </div>
    </div>
);

export const ContextMenuSeparator = () => (
    <div className="bg-gray-200 h-px w-full my-2" />
);

export const ContextMenu = props => (
    <div className="position-absolute" style={{top: props.y, left: props.x}}>
        <div className="bg-white shadow-md w-40 p-3 r-lg d-flex flex-col gap-0 b-1 b-gray-300 b-solid">
            {props.children}
        </div>
    </div>
);

ContextMenu.defaultProps = {
    x: 0,
    y: 0,
};
