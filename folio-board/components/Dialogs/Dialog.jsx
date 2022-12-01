import React from "react";

export const Dialog = props => (
    <div className={props.className} style={{position: "absolute", ...props.style}}>
        <div className="b-1 b-solid b-gray-900 bg-white r-xl shadow-md p-4" style={{width: props.width}}>
            {props.children}
        </div>
    </div>
);

Dialog.defaultProps = {
    className: "",
    // active: false,
    width: "15rem",
    style: {},
};
