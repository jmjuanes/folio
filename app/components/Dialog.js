import React from "react";

export const Dialog = props => {
    if (!props.active) {
        return null; // Dialog is not active
    }
    return (
        <div style={{position: "absolute", ...props.style}}>
            <div className="b-1 b-solid b-dark bg-white radius-md shadow-md p-4" style={{width: props.width}}>
                {props.children}
            </div>
        </div>
    );
};

Dialog.defaultProps = {
    active: false,
    width: "15rem",
    style: {},
};
