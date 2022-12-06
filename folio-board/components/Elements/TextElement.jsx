import React from "react";
import {strokeColors, fontSizes, fontFaces} from "../../styles.js";
import {measureText, stopEventPropagation} from "../../utils/index.js";

export const TextElement = props => {
    const inputRef = React.useRef(null);
    const x = (props.x1 + props.x2) / 2;
    const y = (props.y1 + props.y2) / 2;
    const textSize = fontSizes[props.textSize];
    const textColor = strokeColors[props.textColor];
    const textFont = fontFaces[props.textFont];
    const [textWidth, textHeight] = React.useMemo(() => {
        if (props.text) {
            return measureText(props.text, textSize, textFont);
        }
        // If no text or editing, cancel measure text
        return [0, 0];
    }, [props.editing, props.text, props.textFont, props.textSize]);

    // First time editing --> focus on input
    React.useEffect(() => {
        if (props.editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [props.editing]);

    // Preview styles
    const previewStyles = {
        width: textWidth,
        height: textHeight,
        whiteSpace: "pre-wrap",
        color: textColor,
        fontFamily: textFont,
        fontSize: textSize,
        textAlign: "center",
        userSelect: "none",
    };

    return (
        <g transform={`translate(${x} ${y})`}>
            <foreignObject
                x={(-1) * textWidth / 2}
                y={(-1) * textHeight / 2}
                width={textWidth}
                height={textHeight}
            >
                {props.text && !props.editing && (
                    <div style={previewStyles}>
                        {props.text}
                    </div>
                )}
                {props.editing && (
                    <textarea
                        ref={inputRef}
                        wrap="off"
                        defaultValue={props.text || ""}
                        style={{
                            backgroundColor: "transparent",
                            border: "0px solid transparent",
                            color: textColor,
                            display: "inline-block",
                            fontFamily: textFont,
                            fontSize: textSize,
                            height: textHeight,
                            margin: "0px",
                            minHeight: "1em",
                            minWidth: "1em",
                            outline: "0px",
                            overflow: "hidden",
                            padding: "0px",
                            // position: "absolute",
                            resize: "none",
                            textAlign: "center",
                            // transform: "translateX(-50%) translateY(-50%)",
                            whiteSpace: "break-word",
                            width: textWidth,
                            wordBreak: "pre",
                        }}
                        onMouseDown={stopEventPropagation}
                        onMouseUp={stopEventPropagation}
                        onInput={event => {
                            return props.onChange?.("text", inputRef.current.value || "");
                        }}
                    />
                )}
            </foreignObject>
            {props.text && !props.editing && (
                <rect
                    x={-1 * textWidth / 2}
                    y={-1 * textHeight / 2}
                    width={textWidth}
                    height={textHeight}
                    fill="transparent"
                    stroke="none"
                    onPointerDown={props.onPointerDown}
                    onDoubleClick={props.onDoubleClick}
                />
            )}
        </g>
    );
};

TextElement.defaultProps = {
    text: "",
    onChange: null,
    onPointerDown: null,
    onDoubleClick: null,
};
