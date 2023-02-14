import React from "react";
import classNames from "classnames";

export const Button = props => {
    const classList = classNames(props.className, {
        "d:flex items:center justify:center gap:2 select:none": true,
        "p:3 r:lg": true,
        "cursor:pointer": !props.disabled,
        "o:70 cursor:not-allowed": props.disabled,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            {!!props.icon && (
                <div className={classNames(props.iconClassName, "d:flex items:center")} data-test="icon">
                    {props.icon}
                </div>
            )}
            {!!props.text && (
                <div className={props.textClassName} data-test="text">
                    {props.text}
                </div>
            )}
        </div>
    );
};

Button.defaultProps = {
    className: "",
    text: "",
    textClassName: "",
    icon: null,
    iconClassName: "text:xl",
    disabled: false,
    onClick: null,
};
