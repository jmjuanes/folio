import React from "react";
import kofi from "kofi";

// Export dialog component
export function Dialog (props) {
    if (!props.active) {
        return null; // Dialog is not active
    }
    const classList = kofi.classNames(props.className, {
        "is-absolute": true,
    });
    return (
        <div className={classList} style={props.style}>
            <div className="has-radius-md has-p-4 has-bg-white is-bordered" style={{width:"15rem"}}>
                {props.children}
            </div>
        </div>
    );
}

// Dialog props
Dialog.defaultProps = {
    active: false,
    orientation: "left",
};
