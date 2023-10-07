import React from "react";
import {stopEventPropagation} from "../../utils/events.js";

export const EditableText = props => {
    const input = React.useRef(null);
    const width = Math.max(1, props.width);
    const height = Math.max(1, props.height);
    const previewStyles = {
        width: props.width + "px",
        height: props.height + "px",
        whiteSpace: "pre-wrap", // "pre-wrap",
        color: props.textColor,
        fontFamily: props.textFont,
        fontSize: props.textSize + "px",
        lineHeight: "normal",
        textAlign: props.textAlign,
        userSelect: "none",
        wordBreak: "break-all",
        opacity: props.opacity,
        overflow: "hidden",
    };

    // Enable autofocus when element changes to editable
    React.useEffect(() => {
        if (props.editing && input.current && props.autofocus) {
            input.current.focus();
        }
    }, [props.editing]);

    return (
        <foreignObject x={props.x} y={props.y} width={width} height={height}>
            {!props.editing && (
                <div style={previewStyles}>
                    {(!props.text && props.placeholder) ? (<span style={{opacity:"0.5"}}>{props.placeholder}</span>) : props.text}
                </div>
            )}
            {props.editing && (
                <textarea
                    ref={input}
                    wrap="off"
                    defaultValue={props.text || ""}
                    style={{
                        width: width + "px",
                        height: height + "px",
                        backgroundColor: "transparent",
                        border: "0px solid transparent",
                        color: props.textColor,
                        display: "inline-block",
                        fontFamily: props.textFont,
                        fontSize: props.textSize + "px",
                        lineHeight: "normal",
                        margin: "0px",
                        minHeight: "1em",
                        minWidth: "1em",
                        outline: "0px",
                        overflow: "hidden",
                        padding: "0px",
                        // position: "absolute",
                        resize: "none",
                        textAlign: props.textAlign,
                        // transform: "translateX(-50%) translateY(-50%)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                    }}
                    onPointerDown={stopEventPropagation}
                    onMouseDown={stopEventPropagation}
                    onMouseUp={stopEventPropagation}
                    onChange={props.onChange}
                />
            )}
        </foreignObject>
    );
};

EditableText.defaultProps = {
    autofocus: false,
    placeholder: "",
};
