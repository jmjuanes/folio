import React from "react";
import {renderIcon, ChevronDownIcon} from "@josemi-icons/react";
import {themed} from "../../contexts/theme.jsx";

export const Island = props => (
    <div className={themed("flex gap-1 p-1 rounded-xl", "island", props.className)}>
        {props.children}
    </div>
);

Island.Separator = () => (
    <div className={themed("w-px", "island.separator")} />
);

Island.Button = props => {
    const classList = themed({
        "flex justify-between items-center gap-1 p-2 rounded-lg": true,
        "cursor-pointer": !props.disabled && !props.active,
        "cursor-not-allowed opacity-40 pointer-events-none": props.disabled,
        "island.item": !props.active,
        "island.item.active": !props.disabled && props.active,
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
