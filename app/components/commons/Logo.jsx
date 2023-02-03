import React from "react";
import classNames from "classnames";
import {DrawingIcon} from "@mochicons/react";

export const Logo = props => {
    const classList = classNames("d:flex items:center bg:dark-900", {
        "text:xl p:2 r:lg": props.size === "sm",
        "text:4xl p:3 r:xl": props.size === "md",
        "animation:pulse": props.animated,
    });
    return (
        <div className={classList} onClick={props.onClick}>
            <div className="d:flex text:white">
                <DrawingIcon />
            </div>
        </div>
    );
};

Logo.defaultProps = {
    animated: false,
    size: "sm",
};
