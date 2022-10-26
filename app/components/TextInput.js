import React from "react";

export const TextInput = React.forwardRef((props, ref) => {
    if (!props.visible) {
        return null;
    }
    // Generate text input wrapper
    return (
        <textarea
            ref={ref}
            style={{
                backgroundColor: "transparent",
                border: "0px solid transparent",
                display: "inline-block",
                lineHeight: "1",
                margin: "0px",
                minHeight: "1em",
                minWidth: "1em",
                outline: "0px",
                overflow: "hidden",
                padding: "3px 0px", // Terrible hack to fix text position
                position: "absolute",
                resize: "none",
                whiteSpace: "break-word",
                width: "auto",
                wordBreak: "pre",
            }}
        />
    );
});
