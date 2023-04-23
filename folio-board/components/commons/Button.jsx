import React from "react";
import classNames from "classnames";

export const Button = props => {
    const classList = classNames(props.className, {
        "d-flex items-center justify-center gap-2 select-none": true,
        "p-3 r-lg": true,
        "cursor-pointer": !props.disabled,
        "o-70 cursor-not-allowed": props.disabled,
        "w-full": props.fullWidth,
    });

    return (
        <div className={classList} onClick={props.onClick}>
            {!!props.icon && (
                <div className={classNames(props.iconClassName, "d-flex items-center")} data-test="icon">
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
    iconClassName: "text-xl",
    disabled: false,
    fullWidth: false,
    onClick: null,
};

export const PrimaryButton = props => (
    <Button
        className="bg-gray-800 bg-gray-900:hover text-white"
        textClassName="text-sm"
        iconClassName="text-lg"
        {...props}
    />
);

export const SecondaryButton = props => (
    <Button
        className="bg-white bg-gray-100:hover b-1 b-gray-300 b-solid"
        textClassName="text-sm"
        iconClassName="text-lg"
        {...props}
    />
);
