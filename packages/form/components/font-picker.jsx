import React from "react";
import classNames from "classnames";

export const FontPicker = ({value = "", values = [], text = "Aa", onChange}) => (
    <div className="grid grid-cols-5 gap-1 w-full">
        {(values || []).map(fontName => (
            <div
                key={fontName}
                className={classNames({
                    "flex justify-center items-center rounded-md h-8 text-sm": true,
                    "bg-gray-900 text-white": fontName === value,
                    "bg-gray-600": fontName === value,
                    // "hover:bg-gray-200 cursor-pointer": props.theme === THEMES.LIGHT && font !== props.value,
                    // "hover:bg-gray-700 cursor-pointer": props.theme === THEMES.DARK && font !== props.value,
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
