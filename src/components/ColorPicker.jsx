import React from "react";
import classNames from "classnames";

import {THEMES} from "../constants.js";
import transparentBg from "../assets/transparent.svg";

const getStyleForColor = color => ({
    backgroundColor: color !== "transparent" ? color : null,
    backgroundImage: color === "transparent" ? `url('${transparentBg}')` : null,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
    // minWidth: "1.5rem",
});

const isValidHexColor = value => {
    return value.startsWith("#") && (value.length === 7 || value.length === 9);
};

const validateColor = value => {
    return value && (value === "transparent" || isValidHexColor(value));
};

export const ColorPicker = props => {
    const inputRef = React.useRef(null);
    const pickerRef = React.useRef(null);
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center w-full">
                <div
                    className={classNames({
                        "flex rounded-md h-8 w-8 mr-1": true,
                        "border border-gray-300": props.theme === THEMES.LIGHT,
                        "border border-gray-700": props.theme === THEMES.DARK,
                    })}
                    style={{
                        ...getStyleForColor(props.value),
                        minWidth: "2rem",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        pickerRef.current.value = props.value;
                        pickerRef.current.click();
                    }}
                />
                <input
                    ref={pickerRef}
                    type="color"
                    defaultValue={props.value}
                    className="w-0 p-0 m-0"
                    style={{
                        visibility: "hidden",
                    }}
                    onChange={event => {
                        inputRef.current.value = event.target.value;
                        props.onChange(event.target.value);
                    }}
                />
                <input
                    ref={inputRef}
                    type="text"
                    className={classNames({
                        "w-full px-2 py-0 h-8 bg-white rounded-md outline-0 text-xs text-gray-800": true,
                        "border border-gray-300": props.theme === THEMES.LIGHT,
                        "border border-gray-700": props.theme === THEMES.DARK,
                    })}
                    defaultValue={props.value}
                    style={{
                        fontFamily: "monospace",
                    }}
                    onChange={event => {
                        if (validateColor(event.target.value)) {
                            props.onChange(event.target.value);
                        }
                    }}
                />
            </div>
            {props.values?.length > 0 && (
                <div className="grid gap-1 grid-cols-6 w-full">
                    {props.values.map(color => (
                        <div
                            key={color}
                            className={classNames({
                                "flex w-full h-6 rounded-md cursor-pointer": true,
                                "border border-gray-300": props.theme === THEMES.LIGHT,
                                "border border-gray-700": props.theme === THEMES.DARK,
                            })}
                            style={getStyleForColor(color)}
                            onClick={() => {
                                inputRef.current.value = color;
                                props.onChange(color);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

ColorPicker.defaultProps = {
    value: "",
    values: [],
    theme: THEMES.LIGHT,
    onChange: null,
};
