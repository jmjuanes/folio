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
            <div className="has-radius-md has-w-48 has-p-4 has-bg-gray-100">
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
