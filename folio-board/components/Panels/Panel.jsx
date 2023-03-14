import React from "react";
import classNames from "classnames";

export const Panel = props => {
    const panelWrapperClass = classNames(props.className, "position:absolute z:5 select:none");
    const panelContentClass = classNames({
        "b:1 b:solid b:gray-300": true,
        "r:lg shadow:md items:center bg:white d:flex gap:2 p:2": true,
        "flex:col": props.direction === "col",
    });

    return (
        <div className={panelWrapperClass} style={props.style}>
            <div className={panelContentClass}>
                {props.children}
            </div>
        </div>
    );
};

Panel.defaultProps = {
    className: "",
    style: {},
    direction: "row",
};

export const PanelButton = props => {
    const classList = classNames(props.className, {
        "justify:center items:center r:md d:flex text:lg p:2": true,
        "text:gray-800 bg:gray-800:hover text:white:hover cursor:pointer": !props.active && !props.disabled,
        "is-active bg:gray-800 text:white cursor:pointer": props.active && !props.disabled,
        "is-disabled text:gray-500 cursor:not-allowed o:60": !props.active && props.disabled,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            {props.children}
        </div>
    );
};

PanelButton.defaultProps = {
    className: "",
    active: false,
    disabled: false,
};

export const PanelTextButton = props => {
    const classList = classNames(props.className, {
        "d:flex flex:col w:12": true,
        "justify:center items:center r:md d:flex text:lg p:2": true,
        "text:gray-800 bg:gray-800:hover text:white:hover cursor:pointer": !props.active && !props.disabled,
        "is-active bg:gray-800 text:white cursor:pointer": props.active && !props.disabled,
        "is-disabled text:gray-500 cursor:not-allowed o:60": !props.active && props.disabled,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            {props.children}
            <div className="mt:1 text:3xs">
                <strong>{props.text}</strong>
            </div>
        </div>
    );
};

PanelTextButton.defaultProps = {
    className: "",
    text: "",
    active: false,
    disabled: false,
};

export const PanelSeparator = () => (
    <div className="bg:gray-300 w:12 h:px" />
);
