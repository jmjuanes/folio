import React from "react";
import {SquareIcon, CheckSquareIcon} from "@mochicons/react";
import classNames from "classnames";
import {FORM_OPTIONS} from "../../constants.js";
import {ColorPicker} from "./ColorPicker.jsx";

const optionsWithInlineTitle = new Set([
    FORM_OPTIONS.CHECKBOX,
    FORM_OPTIONS.PIXELS,
    FORM_OPTIONS.RANGE,
]);

const optionTypes = {
    [FORM_OPTIONS.COLOR]: props => (
        <ColorPicker {...props} />
    ),
    [FORM_OPTIONS.FONT]: props => (
        <div className="d-grid cols-5 gap-1 w-full">
            {(props.values || []).map(font => (
                <div
                    key={font}
                    className={classNames({
                        "d-flex justify-center items-center": true,
                        "r-md h-8 text-sm b-1 b-solid b-gray-300": true,
                        "bg-gray-800 text-white": font === props.value,
                        "bg-gray-200:hover cursor-pointer": font !== props.value,
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
    [FORM_OPTIONS.SELECT]: props => (
        <div className={`d-grid cols-${props.grid || "5"} gap-1 w-full`}>
            {(props.values || []).map(item => {
                const itemClass = classNames({
                    "d-flex flex-col justify-center items-center": true,
                    "r-md h-8 b-1 b-solid b-gray-300": true,
                    "bg-gray-800 text-white": item.value === props.value,
                    "bg-gray-200:hover cursor-pointer": item.value !== props.value,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        {!!item.icon && (
                            <div className={classNames("d-flex items-center text-md", item.iconClass)}>
                                {item.icon}
                            </div>
                        )}
                        {!!item.text && (
                            <div className={classNames("d-flex items-center", item.textClass)}>
                                <span className="font-bold text-sm">{item.text}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    ),
    [FORM_OPTIONS.RANGE]: props => (
        <div className="d-flex items-center gap-2">
            {props.title && (
                <div className="text-xs w-16 flex-shrink-0">{props.title}</div>
            )}
            <div className="d-flex items-center">
                <input
                    type="range"
                    className="m-0 w-full bg-gray-300 h-1 mt-3 mb-2"
                    onChange={e => props.onChange(e.target.value || 0)}
                    defaultValue={props.value}
                    min={props.minValue}
                    max={props.maxValue}
                    step={props.step}
                />
            </div>
        </div>
    ),
    [FORM_OPTIONS.CHECKBOX]: props => {
        const handleClick = () => {
            return props.onChange(!props.value);
        };
        return (
            <div className="d-flex items-center justify-between select-none">
                <div className="text-xs">{props.title}</div>
                <div className="text-lg cursor-pointer d-flex items-center" onClick={handleClick}>
                    {props.value ? <CheckSquareIcon /> : <SquareIcon />}
                </div>
            </div>
        );
    },
    [FORM_OPTIONS.PIXELS]: props => (
        <div className="d-flex items-center justify-between select-none">
            <div className="text-xs">
                <strong>{props.title}</strong>
            </div>
            <div className="d-flex items-center">
                <input
                    type="number"
                    className="w-full px-2 py-0 h-8 bg-white r-md outline-0 b-1 b-solid b-gray-300 text-xs"
                    defaultValue={props.value}
                    min={props.minValue}
                    max={props.maxValue}
                    style={{
                        fontFamily: "monospace",
                    }}
                    onChange={event => props.onChange(Number(event.target.value) ?? 0)}
                />
                <span className="text-xs pl-2">px</span>
            </div>
        </div>
    ),
};

export const Option = props => (
    <div className="text-gray-700">
        {(!optionsWithInlineTitle.has(props.type)) && props.title && (
            <div className="text-xs mb-2 select-none">
                {props.title}
            </div>
        )}
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
                value: props.data?.[key] ?? null,
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