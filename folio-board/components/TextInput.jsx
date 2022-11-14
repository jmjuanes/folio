import React from "react";

export const TextInput = React.forwardRef((props, ref) => (
    <textarea
        ref={ref}
        wrap="off"
        style={{
            backgroundColor: "#4184f40d", // "transparent",
            border: "0px solid transparent",
            display: "inline-block",
            // lineHeight: "1",
            margin: "0px",
            minHeight: "1em",
            minWidth: "1em",
            outline: "0px",
            overflow: "hidden",
            padding: "0px!important",
            // padding: "3px 0px", // Terrible hack to fix text position
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
