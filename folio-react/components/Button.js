import React from "react";
import {classNames} from "@siimple/styled";
import {css} from "../styles.js";

const buttonClass = css({
    borderRadius: "0.5rem",
    color: "primary",
    cursor: "pointer",
    fontSize: "1.25rem",
    lineHeight: "1",
    padding: "0.5rem",
    "&:hover, &.is-active": {
        backgroundColor: "primary",
        color: "#fff",
    },
});

export const Button = props => {
    const classList = classNames({
        [buttonClass]: true,
        "is-active": props.active,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            {props.icon}
        </div>
    );
};

Button.defaultProps = {
    active: false,
    icon: null,
};
