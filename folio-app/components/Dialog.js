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
            <div
                className="has-radius-md has-p-4 has-bg-white is-bordered has-shadow-lg"
                style={{
                    width: props.width,
                }}
            >
                {props.children}
            </div>
        </div>
    );
}

// Dialog props
Dialog.defaultProps = {
    active: false,
    orientation: "left",
    width: "15rem",
};
