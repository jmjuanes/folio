import React from "react";
import {measureText} from "../../utils/index.js";

export const InnerText = props => {
    const x = props.x + props.width / 2;
    const y = props.y + props.height / 2;
    const [textWidth, textHeight] = React.useMemo(
        () => measureText(props.text, props.textSize, props.textFont),
        [props.text, props.textFont, props.textSize],
    );

    return (
        <g transform={`translate(${x} ${y})`}>
            <foreignObject
                {...props.elementAttributes}
                x={(-1) * textWidth / 2}
                y={(-1) * textHeight / 2}
                width={textWidth}
                height={textHeight}
            >
                <div
                    {...props.elementAttributes}
                    style={{
                        width: textWidth,
                        height: textHeight,
                        whiteSpace: "pre-wrap",
                        color: props.textColor,
                        fontFamily: props.textFont,
                        fontSize: props.textSize,
                        textAlign: "center",
                        userSelect: "none",
                    }}
                >
                    {props.text}
                </div>
            </foreignObject>
        </g>
    );
};

InnerText.defaultProps = {
    width: 0,
    height: 0,
    text: "",
};
