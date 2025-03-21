import React from "react";
import {themed} from "../../contexts/theme.jsx";

export const FontPicker = ({value = "", values = [], text = "Aa", onChange}) => (
    <div className="grid grid-cols-5 gap-1 w-full">
        {(values || []).map(fontName => (
            <div
                key={fontName}
                className={themed({
                    "flex justify-center items-center rounded-md h-8 text-sm": true,
                    "cursor-pointer": fontName !== value,
                    "form.fontpicker.item.active": fontName === value,
                    "form.fontpicker.item.inactive": fontName !== value,
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
