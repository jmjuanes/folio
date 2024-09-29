import React from "react";
import {renderIcon} from "@josemi-icons/react";
import {themed} from "../../contexts/theme.jsx";

// panel component
export const Panel = props => (
    <div className={themed("rounded-xl relative", "panel", props.className)}>
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

// panel header
Panel.Header = props => (
    <div className={themed("flex items-center justify-between p-2 h-12", "panel.header", props.className)}>
        {props.children}
    </div>
);

// panel header title
Panel.HeaderTitle = props => (
    <div className={themed("text-sm", "panel.header.title", props.className)}>
        {props.children}
    </div>
);

// panel header button
Panel.HeaderButton = ({className, icon, onClick}) => (
    <div className={themed("flex items-center rounded-md cursor-pointer", "panel.header.button", className)} onClick={onClick}>
        <div className="flex p-2 text-base">
            {renderIcon(icon)}
        </div>
    </div>
);

// panel body content
Panel.Body = props => (
    <div className={themed("p-2", "panel.body", props.className)}>
        {props.children}
    </div>
);
