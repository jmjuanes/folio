import React from "react";
import {measureText} from "../math.js";
import {COLORS, FONT_FACES, GRID_SIZE} from "../constants.js";

// Stop event propagation
const stopEventPropagation = event => {
    event?.stopPropagation?.();
    // event?.preventDefault?.();
};

export const TextElement = props => {
    const inputRef = React.useRef(null);
    const x = (props.x1 + props.x2) / 2;
    const y = (props.y1 + props.y2) / 2;
    const width = Math.abs(props.x2 - props.x1);
    const height = Math.abs(props.y2 - props.y1);
    const textSize = (props.textSize ?? 0);
    const textFont = props.textFont ?? FONT_FACES.SANS;
    const textColor = props.textColor ?? COLORS.BLACK;

    // First time editing --> focus on input
    React.useEffect(() => {
        if (props.editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [props.editing]);

    // Preview styles
    const previewStyles = {
        width: props.textWidth,
        height: props.textHeight,
        whiteSpace: "pre", // "pre-wrap",
        color: textColor,
        fontFamily: textFont,
        fontSize: textSize + "px",
        lineHeight: "normal",
        textAlign: "center",
        userSelect: "none",
    };

    return (
        <g transform={`translate(${x} ${y})`}>
            {!props.embedded && (!!props.creating || props.editing) && (
                <rect
                    x={(-1) * Math.max(props.textWidth, width) / 2}
                    y={(-1) * Math.max(props.textHeight, height) / 2}
                    width={Math.max(props.textWidth, width)}
                    height={Math.max(props.textHeight, height)}
                    fill="transparent"
                    stroke="#0d6efd"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                />
            )}
            <foreignObject
                x={(-1) * props.textWidth / 2}
                y={(-1) * props.textHeight / 2}
                width={props.textWidth || "1rem"}
                height={props.textHeight || "1rem"}
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
                            fontSize: textSize + "px",
                            lineHeight: "normal",
                            height: props.textHeight,
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
                            width: props.textWidth,
                            wordBreak: "pre",
                        }}
                        onPointerDown={stopEventPropagation}
                        onMouseDown={stopEventPropagation}
                        onMouseUp={stopEventPropagation}
                        onChange={event => {
                            if (typeof props.onChange === "function") {
                                const text = event.target.value || "";
                                const [textWidth, textHeight] = measureText(text || " ", textSize, textFont);
                                const keys = ["text", "textWidth", "textHeight"];
                                const values = [text, textWidth, textHeight];
                                if (!props.embedded) {
                                    keys.push("x1", "x2", "y1", "y2", "minWidth", "minHeight");
                                    values.push(
                                        Math.min(props.x1, Math.floor((x - textWidth / 2) / GRID_SIZE) * GRID_SIZE),
                                        Math.max(props.x2, Math.ceil((x + textWidth / 2) / GRID_SIZE) * GRID_SIZE),
                                        Math.min(props.y1, Math.floor((y - textHeight / 2) / GRID_SIZE) * GRID_SIZE),
                                        Math.max(props.y2, Math.ceil((y + textHeight / 2) / GRID_SIZE) * GRID_SIZE),
                                        Math.ceil(textWidth / GRID_SIZE) * GRID_SIZE,
                                        Math.ceil(textHeight / GRID_SIZE) * GRID_SIZE,
                                    );
                                }
                                return props.onChange?.(keys, values);
                            }
                        }}
                    />
                )}
            </foreignObject>
            {!props.editing && (
                <rect
                    data-element={props.id}
                    x={(-1) * Math.max(props.textWidth, width) / 2}
                    y={(-1) * Math.max(props.textHeight, height) / 2}
                    width={Math.max(props.textWidth, width)}
                    height={Math.max(props.textHeight, height)}
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
    embedded: false,
    onChange: null,
    onPointerDown: null,
    onDoubleClick: null,
};
