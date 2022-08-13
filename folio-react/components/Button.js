import React from "react";
import {classNames} from "@siimple/styled";
import {css} from "../styles.js";

const buttonClass = css({
    borderRadius: "0.5rem",
    color: "primary",
    fontSize: "1.25rem",
    lineHeight: "1",
    padding: "0.5rem",
    "&.is-hoverable:hover, &.is-active": {
        backgroundColor: "primary",
        color: "#fff",
        cursor: "pointer",
    },
    "&.is-disabled": {
        opacity: "0.25",
    },
});

export const Button = props => {
    const classList = classNames({
        [buttonClass]: true,
        "is-active": props.active && !props.disabled,
        "is-hoverable": !props.disabled,
        "is-disabled": props.disabled,
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
