import React from "react";
import {themed} from "../../contexts/theme.jsx";

// panel component
export const Panel = props => (
    <div className={themed("rounded-xl relative", "panel", props.className)}>
        {props.children}
    </div>
);

// separator for buttons
Panel.Separator = () => (
    <div className={themed("w-full h-px shrink-0", "panel.separator")} />
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
    <div className={themed("text-sm select-none", "panel.header.title", props.className)}>
        {props.children}
    </div>
);

// panel header button
Panel.HeaderButton = ({active, disabled = false, className, children, onClick}) => {
    const classList = themed({
        "flex items-center rounded-md cursor-pointer p-2": true,
        "panel.header.button": true,
        "panel.header.button.active": active,
        "panel.header.button.inactive": !active,
        "opacity-50 pointer-events-none": disabled,
    }, className);
    return (
        <div className={classList} onClick={onClick}>
            {children}
        </div>
    );
};

// panel body content
Panel.Body = ({className, ...props}) => (
    <div className={themed("p-2", "panel.body", className)} {...props} />
);
