import React from "react";
import classNames from "classnames";

export type PanelProps = {
    className?: string,
    children: React.ReactNode,
};

export type PanelTabsProps = {
    className?: string,
    children: React.ReactNode,
};

export type PanelTabsItemProps = {
    className?: string,
    style?: React.CSSProperties,
    active?: boolean,
    onClick?: () => void,
    children: React.ReactNode,
};

export type PanelBodyProps = {
    className?: string,
    children: React.ReactNode,
};

// @description main panel component
export const Panel = (props: PanelProps): React.JSX.Element => (
    <div className={classNames("rounded-xl relative border-1 border-gray-200 shadow-sm bg-white", props.className)}>
        {props.children}
    </div>
);

// separator for buttons
Panel.Separator = (): React.JSX.Element => (
    <div className="w-full h-px shrink-0 bg-gray-200" />
);

// panel tabs container
Panel.Tabs = (props: PanelTabsProps): React.JSX.Element => (
    <div className={classNames("flex items-center gap-1 flex-nowrap p-1 rounded-lg bg-gray-100 m-2", props.className)}>
        {props.children}
    </div>
);

// @description tab item for the panel header
// @param {object} props React props object
// @param {string} props.className custom class string
// @param {object} props.style custom style for the tab item
// @param {boolean} props.active to display the tab as active
// @param {function} props.onClick click listener
Panel.TabsItem = (props: PanelTabsItemProps): React.JSX.Element => {
    const classList = classNames({
        "rounded-lg flex justify-center items-center flex p-1 w-full text-lg": true,
        "text-gray-600 hover:text-gray-900 cursor-pointer": !props.active,
        "bg-white text-gray-950 shadow-sm border-1 border-gray-200": props.active,
    }, props.className);
    
    return (
        <div className={classList} style={props.style} onClick={props.onClick}>
            {props.children}
        </div>
    );
};

// @description panel body content
Panel.Body = ({className, ...otherProps}: PanelBodyProps): React.JSX.Element => (
    <div className={classNames("p-2", className)} {...otherProps} />
);
