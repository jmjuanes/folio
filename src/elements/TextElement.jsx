import React from "react";
import {measureText} from "../utils/math.js";
import {COLORS, FONT_FACES, GRID_SIZE, TEXTURES, TEXT_ALIGNS} from "../constants.js";

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
    const textSize = props.textSize ?? 0;
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
        width: Math.max(width, GRID_SIZE) + "px",
        height: props.textHeight + "px",
        whiteSpace: "pre-wrap", // "pre-wrap",
        color: textColor,
        fontFamily: textFont,
        fontSize: textSize + "px",
        lineHeight: "normal",
        textAlign: props.textAlign || TEXT_ALIGNS.CENTER,
        userSelect: "none",
        wordBreak: "break-all",
        opacity: props.opacity,
    };

    return (
        <g transform={`translate(${x} ${y})`} filter={`url(#${TEXTURES.PENCIL})`}>
            {!props.embedded && (!!props.creating || props.editing) && (
                <rect
                    x={(-1) * width / 2}
                    y={(-1) * height / 2}
                    width={width}
                    height={height}
                    fill={props.editing ? "#0d6efd" : "transparent"}
                    fillOpacity="0.1"
                    stroke={props.editing ? "none" : "#0d6efd"}
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    rx={props.editing ? "8" : "0"}
                />
            )}
            <foreignObject
                x={(-1) * width / 2}
                y={(-1) * props.textHeight / 2}
                width={Math.max(width, GRID_SIZE)}
                height={props.textHeight}
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
                            width: Math.max(width, GRID_SIZE) + "px",
                            height: props.textHeight + "px",
                            backgroundColor: "transparent",
                            border: "0px solid transparent",
                            color: textColor,
                            display: "inline-block",
                            fontFamily: textFont,
                            fontSize: textSize + "px",
                            lineHeight: "normal",
                            margin: "0px",
                            minHeight: "1em",
                            minWidth: "1em",
                            outline: "0px",
                            overflow: "hidden",
                            padding: "0px",
                            // position: "absolute",
                            resize: "none",
                            textAlign: props.textAlign || TEXT_ALIGNS.CENTER,
                            // transform: "translateX(-50%) translateY(-50%)",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                        }}
                        onPointerDown={stopEventPropagation}
                        onMouseDown={stopEventPropagation}
                        onMouseUp={stopEventPropagation}
                        onChange={event => {
                            if (typeof props.onChange === "function") {
                                const text = event.target.value || "";
                                const [textWidth, textHeight] = measureText(text || " ", textSize, textFont, width + "px");
                                const keys = ["text", "textWidth", "textHeight"];
                                const values = [text, textWidth, textHeight];
                                if (!props.embedded) {
                                    keys.push("y2");
                                    values.push(props.y1 + Math.ceil(textHeight / GRID_SIZE) * GRID_SIZE);
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
                    x={(-1) * width / 2}
                    y={(-1) * height / 2}
                    width={width}
                    height={height}
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
