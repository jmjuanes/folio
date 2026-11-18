import React from "react";
import classNames from "classnames";

export const FontPicker = ({value = "", values = [], text = "Aa", onChange}) => (
    <div className="grid grid-cols-5 gap-1 w-full" data-testid="fontpicker">
        {(values || []).map(fontName => (
            <div
                key={fontName}
                data-testid="fontpicker-item"
                className={classNames({
                    "flex justify-center items-center rounded-md h-8 text-sm": true,
                    "cursor-pointer": fontName !== value,
                    "active bg-gray-900 text-white": fontName === value,
                    "text-gray-900 bg-gray-100 hover:bg-gray-200": fontName !== value,
                })}
                style={{
                    fontFamily: fontName,
                }}
                onClick={() => onChange?.(fontName)}
            >
                <strong>{text}</strong>
            </div>
        ))}
    </div>
);
