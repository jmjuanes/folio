import React from "react";
import classNames from "classnames";
import {THEMES} from "@lib/constants.js";
import {isValidHexColor} from "@lib/utils/colors.js";

export const ColorPicker = props => {
    const inputRef = React.useRef(null);
    const pickerRef = React.useRef(null);
    return (
        <div data-testid="colorpicker" className="flex flex-col gap-2 w-full">
            {props.showInput && (
                <div className="flex items-center w-full">
                    <div
                        data-testid="colorpicker:preview"
                        className={classNames({
                            "flex rounded-md h-8 w-8 mr-1": true,
                            "border border-neutral-200": props.theme === THEMES.LIGHT,
                            // "border border-gray-700": props.theme === THEMES.DARK,
                        })}
                        style={{
                            backgroundColor: props.value,
                            minWidth: "2rem",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            pickerRef.current.value = props.value;
                            pickerRef.current.click();
                        }}
                    />
                    <input
                        data-testid="colorpicker:pick"
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
                        data-testid="colorpicker:input"
                        ref={inputRef}
                        type="text"
                        className={classNames({
                            "w-full px-2 py-0 h-8 rounded-md outline-0 text-xs border": true,
                            "bg-white border-neutral-200 text-neutral-800": props.theme === THEMES.LIGHT,
                            // "border border-gray-700": props.theme === THEMES.DARK,
                        })}
                        defaultValue={props.value}
                        style={{
                            fontFamily: "monospace",
                        }}
                        onChange={event => {
                            if (isValidHexColor(event.target.value)) {
                                props.onChange(event.target.value);
                            }
                        }}
                    />
                </div>
            )}
            {(props.values?.length > 0 && props.showPalette) && (
                <div data-testid="colorpicker:palette" className="grid gap-1 grid-cols-6 w-full">
                    {props.values.map(color => (
                        <div
                            key={color}
                            data-testid={"color:" + color}
                            className={classNames({
                                "flex w-full h-6 rounded-md cursor-pointer": true,
                                "border border-neutral-200": props.theme === THEMES.LIGHT,
                                // "border border-gray-700": props.theme === THEMES.DARK,
                            })}
                            style={{
                                backgroundColor: color,
                            }}
                            onClick={() => {
                                if (props.showInput && inputRef.current) {
                                    inputRef.current.value = color;
                                }
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
    showInput: true,
    showPalette: true,
    theme: THEMES.LIGHT,
    onChange: null,
};
