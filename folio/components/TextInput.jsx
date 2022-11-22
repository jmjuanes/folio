import React from "react";

export const TextInput = React.forwardRef((props, ref) => (
    <textarea
        ref={ref}
        wrap="off"
        style={{
            backgroundColor: "transparent",
            border: "0px solid transparent",
            display: "inline-block",
            margin: "0px",
            minHeight: "1em",
            minWidth: "1em",
            outline: "0px",
            overflow: "hidden",
            padding: "0px",
            position: "absolute",
            resize: "none",
            textAlign: "center",
            transform: "translateX(-50%) translateY(-50%)",
            whiteSpace: "break-word",
            width: "auto",
            wordBreak: "pre",
        }}
    />
));
