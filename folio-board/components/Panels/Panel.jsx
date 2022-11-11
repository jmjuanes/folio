import React from "react";
import classNames from "classnames";

export const Panel = props => {
    const panelWrapperClass = classNames({
        "position-absolute z-10": true,
        "top-0 left-0 pl-4 pt-4": props.position === "top-left",
        "top-0 right-0 pr-4 pt-4": props.position === "top-right",
        "bottom-0 left-0 pb-4 pl-4": props.position === "bottom-left",
        "bottom-0 right-0 pb-4 pr-4": props.position === "bottom-right",
        "bottom-0 left-half pb-4": props.position === "bottom-center",
    });
    // TODO: we should move this to a classname
    const panelWrapperStyle = {
        transform: props.position === "bottom-center" ? "translateX(-50%)" : null,
        ...props.style,
    };
    const panelContentClass = classNames({
        "b-1 b-solid b-gray-900 r-lg": true,
        "shadow-md items-center bg-white d-flex gap-2 p-2": true,
        "flex-col": props.position === "top-left" || props.position === "top-right",
    });
    return (
        <div className={panelWrapperClass} style={panelWrapperStyle}>
            <div className={panelContentClass}>
                {props.children}
            </div>
        </div>
    );
};

export const PanelButton = props => {
    // TODO: missing height: 2.25rem height!!
    const classList = classNames({
        "items-center r-md d-flex text-lg p-2": true,
        "text-gray-900 hover:bg-gray-900 hover:text-white cursor-pointer": !props.active && !props.disabled,
        "is-active bg-gray-900 text-white cursor-pointer": props.active && !props.disabled,
        "is-disabled text-gray-900 cursor-not-allowed o-60": !props.active && props.disabled,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {props.children}
        </div>
    );
};

PanelButton.defaultProps = {
    active: false,
    disabled: false,
};

