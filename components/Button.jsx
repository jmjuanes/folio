import React from "react";
import classNames from "classnames";

export const Button = props => {
    const classList = classNames(props.className, {
        "flex items-center justify-center gap-2 select-none": true,
        "p-3 rounded-md": true,
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
                    <span>{props.text}</span>
                </div>
            )}
        </div>
    );
};

Button.defaultProps = {
    testid: "btn",
    className: "",
    text: "",
    textClassName: "text-sm",
    icon: null,
    iconClassName: "text-xl",
    disabled: false,
    fullWidth: false,
    style: null,
    onClick: null,
};

export const PrimaryButton = props => (
    <Button
        testid="btn-primary"
        className="bg-neutral-950 hover:bg-neutral-900 text-white"
        {...props}
    />
);

export const SecondaryButton = props => (
    <Button
        testid="btn-secondary"
        className="bg-white text-neutral-900 hover:bg-neutral-200 border border-neutral-200"
        {...props}
    />
);
