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
        <div className={classList} onClick={props.onClick} style={props.style}>
            {!!props.icon && (
                <div className={classNames(props.iconClassName, "flex items-center")} data-test="icon">
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
    iconClassName: "text-2xl",
    disabled: false,
    fullWidth: false,
    style: null,
    onClick: null,
};

export const PrimaryButton = props => (
    <Button
        className="bg-gray-800 hover:bg-gray-900 text-white"
        textClassName="text-sm"
        iconClassName="text-xl"
        {...props}
    />
);

export const SecondaryButton = props => (
    <Button
        className="bg-white hover:bg-gray-100 border border-gray-300"
        textClassName="text-sm"
        iconClassName="text-xl"
        {...props}
    />
);
