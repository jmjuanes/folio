import React from "react";
import {themed} from "../../contexts/theme.jsx";

// panel component
export const Panel = props => (
    <div className={themed("rounded-xl", "panel", props.className)}>
        {props.children}
    </div>
);

// separator for buttons
Panel.Separator = () => (
    <div className={themed("w-full h-px", "panel.separator")} />
);

// panel tabs container
Panel.Tabs = props => (
    <div className={themed("flex gap-1 items-center flex-nowrap rounded-lg p-1", "panel.tabs")}>
        {props.children}
    </div>
);

Panel.TabsItem = props => {
    const classList = themed({
        "rounded-md flex justify-center items-center flex gap-0 p-2 cursor-pointer w-full": true,
        "panel.tabs.item.inactive": !props.active,
        "panel.tabs.item.active": props.active,
    }, props.className);
    return (
        <div className={classList} style={props.style} onClick={props.onClick}>
            <div className="flex items-center">
                {props.children}
            </div>
        </div>
    );
};
