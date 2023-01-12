import React from "react";

export const Dialog = props => (
    <div className={props.className} style={{position: "absolute", ...props.style}}>
        <div className="bg:white r:xl shadow:md p:6 z:5" style={{width: props.width}}>
            {props.children}
        </div>
    </div>
);

Dialog.defaultProps = {
    className: "",
    // active: false,
    width: "16rem",
    style: {},
};
