import React from "react";
import { stopEventPropagation } from "../../utils/events.js";

type PlaceholderProps = {
    value?: string;
};

const Placeholder = (props: PlaceholderProps): React.JSX.Element => (
    <span style={{opacity:"0.5"}}>{props.value || ""}</span>
);

export type EditableTextProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    textFont: string;
    textSize: number;
    textColor: string;
    textAlign: "left" | "center" | "right";
    placeholder?: string;
    opacity?: number;
    editing?: boolean;
    autofocus?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
};

export const EditableText = (props: EditableTextProps): React.JSX.Element => {
    const input = React.useRef<HTMLTextAreaElement>(null);
    const width = Math.max(1, props.width);
    const height = Math.max(1, props.height);
    const opacity = props.editing ? 1 : props.opacity ?? 1;
    const previewStyles: React.CSSProperties = {
        width: props.width + "px",
        height: props.height + "px",
        whiteSpace: "pre-wrap",
        color: props.textColor,
        fontFamily: props.textFont,
        fontSize: props.textSize + "px",
        lineHeight: "normal",
        textAlign: props.textAlign,
        userSelect: "none",
        // wordBreak: "break-all",
        overflow: "hidden",
        overflowWrap: "break-word",
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
                            resize: "none",
                            textAlign: props.textAlign,
                            // transform: "translateX(-50%) translateY(-50%)",
                            whiteSpace: "pre-wrap",
                            // wordBreak: "break-all",
                            overflowWrap: "break-word",
                        }}
                        onPointerDown={stopEventPropagation}
                        onMouseDown={stopEventPropagation}
                        onMouseUp={stopEventPropagation}
                        onChange={props.onChange}
                        onBlur={props.onBlur}
                    />
                )}
            </foreignObject>
        </g>
    );
};
