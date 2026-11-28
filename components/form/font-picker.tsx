import classNames from "classnames";
import type { JSX } from "react";

export type FontPickerProps = {
    value?: string;
    values?: string[];
    text?: string;
    onChange?: (fontName: string) => void;
};

export const FontPicker = (props: FontPickerProps): JSX.Element => (
    <div className="grid grid-cols-6 gap-1 w-full" data-testid="fontpicker">
        {(props.values || []).map((fontName: string) => (
            <div
                key={fontName}
                data-testid="fontpicker-item"
                className={classNames({
                    "flex justify-center items-center rounded-md h-8 text-sm": true,
                    "cursor-pointer": fontName !== props.value,
                    "active bg-gray-900 text-white": fontName === props.value,
                    "text-gray-900 bg-gray-100 hover:bg-gray-200": fontName !== props.value,
                })}
                style={{
                    fontFamily: fontName,
                }}
                onClick={() => props.onChange?.(fontName)}
            >
                <strong>{props.text || "Aa"}</strong>
            </div>
        ))}
    </div>
);
