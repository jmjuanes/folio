import React from "react";
import classNames from "classnames";
import {renderIcon, ChevronDownIcon} from "@josemi-icons/react";

// @description a container for grouping elements in the editor layout
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className additional class name
export const Island = props => (
    <div className={classNames("flex gap-1 p-1 rounded-xl shadow-sm bg-white border-neutral-200", props.className)}>
        {props.children}
    </div>
);

// @description a vertical separator for the Island component
Island.Separator = () => (
    <div className="w-px bg-neutral-200" />
);

// @description a button for the Island component
// @param {object} props React props
// @param {React.ReactNode} props.children React children
// @param {string} props.className additional class name
// @param {string} props.icon icon name
// @param {string} props.text button text
// @param {boolean} props.disabled is the button disabled
// @param {boolean} props.active is the button active
// @param {boolean} props.showChevron should the button show a chevron
// @param {function} props.onClick button click handler
Island.Button = props => {
    const classList = classNames({
        "flex justify-between items-center gap-1 p-2 rounded-lg": true,
        "cursor-pointer": !props.disabled,
        "cursor-not-allowed opacity-40 pointer-events-none": props.disabled,
        "hover:bg-neutral-200 text-neutral-900 group-focus-within:bg-neutral-950 group-focus-within:text-white": !props.active,
        "bg-neutral-950 text-white": !props.disabled && props.active,
    }, props.className);
    const handleClick = () => {
        return !props.disabled && props?.onClick?.();
    };
    return (
        <div className={classList} onClick={handleClick}>
            <div className="flex items-center gap-1">
                {props.icon && (
                    <div className="flex items-center text-xl">
                        {renderIcon(props.icon)}
                    </div>
                )}
                {props.text && (
                    <div className="flex items-center text-sm font-medium">
                        {props.text}
                    </div>
                )}
            </div>
            {props.showChevron && (
                <div className="text-xs flex items-center">
                    <ChevronDownIcon />
                </div>
            )}
        </div>
    );
};
