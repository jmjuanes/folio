import React from "react";
import classNames from "classnames";

export const Button = props => {
    const classList = classNames(props.className, {
        "flex items-center justify-center gap-2 select-none": true,
        "p-3 rounded-lg": true,
        "cursor-pointer": !props.disabled,
        "o-70 cursor-not-allowed": props.disabled,
        "w-full": props.fullWidth,
    });
    return (
        <div data-testid={props.testid} className={classList} onClick={props.onClick} style={props.style}>
            {!!props.icon && (
                <div className={classNames(props.iconClassName, "flex items-center")} data-testid="btn-icon">
                    {props.icon}
                </div>
            )}
            {!!props.text && (
                <div className={props.textClassName} data-testid="btn-text">
                    <strong>{props.text}</strong>
                </div>
            )}
        </div>
    );
};

Button.defaultProps = {
    testid: "btn",
    className: "",
    text: "",
    textClassName: "",
    icon: null,
    iconClassName: "text-2xl",
    disabled: false,
    fullWidth: false,
    style: null,
    onClick: null,
};

export const PrimaryButton = props => (
    <Button
        testid="btn-primary"
        className="bg-gray-800 hover:bg-gray-900 text-white"
        textClassName="text-sm"
        iconClassName="text-xl"
        {...props}
    />
);

export const SecondaryButton = props => (
    <Button
        testid="btn-secondary"
        className="bg-white hover:bg-gray-900 hover:text-white border-2 border-gray-900"
        textClassName="text-sm"
        iconClassName="text-xl"
        {...props}
    />
);
