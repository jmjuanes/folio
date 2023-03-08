import React from "react";
import {COLORS} from "folio-core";

const transparentImage = window.encodeURIComponent([
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#fdfdfd">`,
    `<rect x="0" y="0" width="8" height="8" fill="#cacacc" />`,
    `<rect x="8" y="8" width="8" height="8" fill="#cacacc" />`,
    `</svg>`,
].join(""));

const getStyleForColor = color => ({
    backgroundColor: color !== "transparent" ? color : null,
    backgroundImage: color === "transparent" ? `url('data:image/svg+xml;utf-8,${transparentImage}')` : null,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
    minWidth: "2rem",
});

export const ColorPicker = props => (
    <div className="d:flex flex:col gap:2 w:full">
        <div className="d:flex items:center gap:1 w:full">
            <div
                className="d:flex r:md h:8 w:8 b:1 b:solid b:gray-300"
                style={getStyleForColor(props.value)}
            />
            <input
                type="text"
                data-field={props.field}
                className="w:full px:2 py:0 h:8 bg:white r:md outline:0 b:1 b:solid b:gray-300 text:xs"
                defaultValue={props.value}
                style={{
                    fontFamily: "monospace",
                }}
                onChange={event => props.onChange(event.target.value || COLORS.BLACK)}
            />
        </div>
        {props.values?.length > 0 && (
            <div className="d:grid gap:1 cols:5 w:full">
                {props.values.map(color => (
                    <div
                        key={color}
                        className="d:flex w:8 h:8 r:md cursor:pointer b:1 b:solid b:gray-300"
                        style={getStyleForColor(color)}
                        onClick={() => {
                            // Terrible hack to change the input color
                            document.querySelector(`input[data-field="${props.field}"]`).value = color;
                            props.onChange(color);
                        }}
                    />
                ))}
            </div>
        )}
    </div>
);

ColorPicker.defaultProps = {
    value: "",
    values: [],
    onChange: null,
};
