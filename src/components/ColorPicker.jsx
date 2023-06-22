import React from "react";
import classNames from "classnames";

import {DropletIcon} from "./Icons.jsx";
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
    const [colorPaletteVisible, setColorPaletteVisible] = React.useState(false);
    
    const handleColorPaletteClick = () => {
        return setColorPaletteVisible(!colorPaletteVisible);
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center w-full">
                <div
                    className="flex rounded-md h-8 w-8 border border-gray-300 mr-1"
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
                    className="w-full px-2 py-0 h-8 bg-white rounded-md outline-0 border border-gray-300 text-xs"
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
                {props.collapseColorPalette && (
                    <div
                        className={classNames({
                            "flex items-center px-1 py-2 rounded-md border border-gray-300 ml-1": true,
                            "hover:bg-gray-200 cursor-pointer": !colorPaletteVisible,
                            "bg-gray-800 text-white cursor-pointer": colorPaletteVisible,
                        })}
                        title="Expand/Collapse color palette"
                        onClick={handleColorPaletteClick}
                    >
                        <DropletIcon />
                    </div>
                )}
            </div>
            {props.values?.length > 0 && (colorPaletteVisible || !props.collapseColorPalette) && (
                <div className="grid gap-1 grid-cols-6 w-full">
                    {props.values.map(color => (
                        <div
                            key={color}
                            className="flex w-full h-6 rounded cursor-pointer border border-gray-300"
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
    onChange: null,
    collapseColorPalette: true,
};
