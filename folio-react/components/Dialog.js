import React from "react";
import {css} from "../styles.js";

const dialogClass = css({
    apply: [
        "mixins.shadowed",
        "mixins.bordered",
    ],
    backgroundColor: "#fff",
    borderRadius: "0.5rem",
    padding: "1rem",
});

export const Dialog = props => {
    if (!props.active) {
        return null; // Dialog is not active
    }
    return (
        <div style={{position: "absolute", ...props.style}}>
            <div
                className={dialogClass}
                style={{
                    width: props.width,
                }}
            >
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
