import React from "react";
import classNames from "classnames";
import {ColorPicker} from "./ColorPicker.jsx";

const optionTypes = {
    color: props => (
        <ColorPicker {...props} />
    ),
    font: props => (
        <div className="d-grid cols-4 gap-1 w-full">
            {(props.values || []).map(font => (
                <div
                    key={font}
                    className={classNames({
                        "d-flex justify-center items-center": true,
                        "r-md cursor-pointer w-10 h-10 text-md": true,
                        "bg-gray-800 text-white": font === props.value,
                    })}
                    style={{
                        fontFamily: font,
                    }}
                    onClick={() => props.onChange(font)}
                >
                    <strong>Aa</strong>
                </div>
            ))}
        </div>
    ),
    select: props => (
        <div className={`d-grid cols-${props.grid || "4"} gap-1 w-full`}>
            {(props.values || []).map(item => {
                const itemClass = classNames({
                    "d-flex flex-col justify-center items-center": true,
                    "r-md cursor-pointer w-10 h-10": true,
                    "bg-gray-800 text-white": item.value === props.value,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        {!!item.icon && (
                            <div className={classNames("d-flex items-center text-lg", item.iconClass)}>
                                {item.icon}
                            </div>
                        )}
                        {!!item.text && (
                            <div className={classNames("d-flex items-center", item.textClass)}>
                                <span className="font-bold">{item.text}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    ),
    range: props => (
        <input
            type="range"
            className="m-0 w-full bg-gray-300 h-1 mt-3 mb-2"
            onChange={e => props.onChange(e.target.value || 0)}
            defaultValue={props.value}
            min={props.minValue}
            max={props.maxValue}
            step={props.step}
        />
    ),
};

export const Option = props => (
    <div className="text-gray-700">
        <div className="text-xs mb-2 select-none">
            <strong>{props.title || ""}</strong>
        </div>
        <div className="d-block">
            {optionTypes[props.type](props)}
        </div>
        {!!props.helper && (
            <div className="text-gray-400 text-2xs mt-0 select-none">
                {props.helper}
            </div>
        )}
    </div>
);

// TODO: check the visible field of each item to decide if item should be visible
const getVisibleItems = (items, data) => {
    return Object.keys(items || {});
};

export const Form = props => (
    <div className={props.className} style={props.style}>
        {getVisibleItems(props.items, props.data).map(key => {
            const item = props.items[key];
            return React.createElement(Option, {
                ...item,
                key: key,
                field: key,
                value: props.data?.[key] || null,
                onChange: value => props.onChange?.(key, value),
            });
        })}
    </div>
);

Form.defaultProps = {
    className: "d-flex flex-col gap-4",
    data: {},
    items: {},
    style: {},
    onChange: null,
};
