import React from "react";
import classNames from "classnames";

export const Button = props => {
    const classList = classNames(props.className, {
        "d:flex items:center justify:center gap:2 select:none": true,
        "px:4 py:3 r:xl": true,
        "cursor:pointer": !props.disabled,
        "o:80 cursor:not-allowed": props.disabled,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            {!!props.icon && (
                <div className="text:xl d:flex items:center" data-test="icon">
                    {props.icon}
                </div>
            )}
            {!!props.text && (
                <div className="" data-test="text">
                    {props.text}
                </div>
            )}
        </div>
    );
};

Button.defaultProps = {
    className: "",
    text: "",
    icon: null,
    disabled: false,
    onClick: null,
};
