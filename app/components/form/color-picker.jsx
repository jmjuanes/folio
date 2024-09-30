import React from "react";
import {themed} from "../../contexts/theme.jsx";
import {isValidHexColor} from "../../utils/colors.js";

export const ColorPicker = ({value = "", values = [], showInput = true, showPalette = true, onChange}) => {
    const inputRef = React.useRef(null);
    const pickerRef = React.useRef(null);
    return (
        <div data-testid="colorpicker" className="flex flex-col gap-2 w-full">
            {showInput && (
                <div className="flex items-center w-full">
                    <div
                        data-testid="colorpicker:preview"
                        className={themed("flex rounded-md h-8 w-8 mr-1", "form.colorpicker.preview")}
                        style={{
                            backgroundColor: value,
                            minWidth: "2rem",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            pickerRef.current.value = value;
                            pickerRef.current.click();
                        }}
                    />
                    <input
                        data-testid="colorpicker:pick"
                        ref={pickerRef}
                        type="color"
                        defaultValue={value}
                        className="w-0 p-0 m-0"
                        style={{
                            visibility: "hidden",
                        }}
                        onChange={event => {
                            inputRef.current.value = event.target.value;
                            onChange?.(event.target.value);
                        }}
                    />
                    <input
                        data-testid="colorpicker:input"
                        ref={inputRef}
                        type="text"
                        className={themed("w-full px-2 py-0 h-8 rounded-md outline-0 text-xs", "form.colorpicker.input")}
                        defaultValue={value}
                        style={{
                            fontFamily: "monospace",
                        }}
                        onChange={event => {
                            if (isValidHexColor(event.target.value)) {
                                onChange?.(event.target.value);
                            }
                        }}
                    />
                </div>
            )}
            {(values?.length > 0 && showPalette) && (
                <div data-testid="colorpicker:palette" className="grid gap-1 grid-cols-6 w-full">
                    {values.map(color => (
                        <div
                            key={color}
                            className={themed("flex w-full h-6 rounded-md cursor-pointer", "form.colorpicker.palette.item")}
                            style={{
                                backgroundColor: color,
                            }}
                            onClick={() => {
                                if (showInput && inputRef.current) {
                                    inputRef.current.value = color;
                                }
                                onChange?.(color);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
