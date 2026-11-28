import { useRef } from "react";
import classNames from "classnames";
import { isValidHexColor } from "../../lib/utils/colors.ts";
import type { JSX } from "react/jsx-runtime";

export type ColorPickerProps = {
    value?: string;
    values?: string[];
    showInput?: boolean;
    showPalette?: boolean;
    onChange?: (color: string) => void;
};

export const ColorPicker = ({ showPalette = true, showInput = true, ...props }: ColorPickerProps): JSX.Element => {
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<HTMLInputElement>(null);
    return (
        <div data-testid="colorpicker" className="flex flex-col gap-2 w-full">
            {showInput && (
                <div className="flex items-center w-full">
                    <div
                        data-testid="colorpicker-preview"
                        className={classNames({
                            "flex rounded-md h-8 w-8 mr-1": true,
                            "border-1 border-gray-200": true,
                        })}
                        style={{
                            backgroundColor: props.value,
                            minWidth: "2rem",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            if (pickerRef.current && props.value) {
                                pickerRef.current.value = props.value;
                                pickerRef.current.click();
                            }
                        }}
                    />
                    <input
                        data-testid="colorpicker-pick"
                        ref={pickerRef}
                        type="color"
                        defaultValue={props.value}
                        className="w-0 p-0 m-0"
                        style={{
                            visibility: "hidden",
                        }}
                        onChange={event => {
                            if (showInput && inputRef.current) {
                                inputRef.current.value = event.target.value;
                            }
                            props.onChange?.(event.target.value);
                        }}
                    />
                    <input
                        data-testid="colorpicker-input"
                        ref={inputRef}
                        type="text"
                        className={classNames({
                            "w-full px-2 py-0 h-8 rounded-md outline-0 text-xs": true,
                            "bg-white border-1 border-gray-200 text-gray-900": true,
                        })}
                        defaultValue={props.value}
                        style={{
                            fontFamily: "monospace",
                        }}
                        onChange={event => {
                            if (isValidHexColor(event.target.value)) {
                                props.onChange?.(event.target.value);
                            }
                        }}
                    />
                </div>
            )}
            {((props.values || []).length > 0 && showPalette) && (
                <div data-testid="colorpicker-values" className="grid gap-1 grid-cols-6 w-full">
                    {(props.values || []).map((color: string) => (
                        <div
                            key={color}
                            data-testid="colorpicker-value"
                            className={classNames({
                                "flex w-full h-6 rounded-md cursor-pointer": true,
                                "border-1 border-gray-200": true,
                            })}
                            style={{
                                backgroundColor: color,
                            }}
                            onClick={() => {
                                if (showInput && inputRef.current) {
                                    inputRef.current.value = color;
                                }
                                props.onChange?.(color);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
