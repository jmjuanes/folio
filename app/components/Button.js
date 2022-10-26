import React from "react";
import classNames from "classnames";

// TODO: missing height: 2.25rem height!!

export const Button = props => {
    const classList = classNames({
        "items-center radius-md c-dark d-flex size-lg p-4": true,
        "is-active bg-dark c-white cursor-pointer": props.active && !props.disabled,
        "is-hoverable hover:bg-dark hover:c-white cursor-pointer": !props.active && !props.disabled,
        "is-disabled cursor-not-allowed o-60": props.disabled,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon}
        </div>
    );
};

Button.defaultProps = {
    active: false,
    disabled: false,
    icon: null,
};
