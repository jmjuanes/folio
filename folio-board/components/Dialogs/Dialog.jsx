import React from "react";

export const Dialog = props => (
    <div
        className={props.className}
        style={{
            position: "absolute",
            ...props.style,
        }}
    >
        <div
            className="bg:white r:xl shadow:md p:6 z:5 b:1 b:solid b:light-900"
            style={{
                width: props.width,
            }}
        >
            {props.children}
        </div>
    </div>
);

Dialog.defaultProps = {
    className: "",
    width: "16rem",
    style: {},
};
