import React from "react";
import {stopEventPropagation} from "@lib/utils/events.js";

const Placeholder = props => (
    <span style={{opacity:"0.5"}}>{props.value || ""}</span>
);

export const EditableText = props => {
    const input = React.useRef(null);
    const width = Math.max(1, props.width);
    const height = Math.max(1, props.height);
    const opacity = props.editing ? 1 : props.opacity;
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
        overflow: "hidden",
    };

    // Enable autofocus when element changes to editable
    React.useEffect(() => {
        if (props.editing && input.current && props.autofocus) {
            input.current.focus();
        }
    }, [props.editing]);

    return (
        <g opacity={opacity}>
            <foreignObject x={props.x} y={props.y} width={width} height={height}>
                {!props.editing && (
                    <div style={previewStyles}>
                        {props.text ? props.text : (<Placeholder value={props.placeholder} />)}
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
        </g>
    );
};

EditableText.defaultProps = {
    autofocus: false,
    editing: false,
    placeholder: "",
    opacity: 1,
};
