import React from "react";
import classNames from "classnames";
import {SquareIcon, CheckSquareIcon} from "@josemi-icons/react";
import {FORM_OPTIONS, THEMES} from "@lib/constants.js";
import {ColorPicker} from "@components/commons/color-picker.jsx";

const optionsWithInlineTitle = new Set([
    FORM_OPTIONS.CHECKBOX,
    FORM_OPTIONS.PIXELS,
    FORM_OPTIONS.RANGE,
    FORM_OPTIONS.SEPARATOR,
]);

// Tiny utility to check if a value is active
const checkIsActive = (value, currentValue, isActiveFn, data) => {
    if (typeof isActiveFn === "function") {
        return isActiveFn(value, currentValue, data);
    }
    // Other case, just check if value is the current value
    return value === currentValue;
};

// Tiny utility to check if a value is visible
const checkIsVisible = (value, currentValue, isVisibleFn, data) => {
    if (typeof isVisibleFn === "function") {
        return !!isVisibleFn(value, currentValue, data);
    }
    // By default, item is visible
    return true;
};

const optionTypes = {
    [FORM_OPTIONS.COLOR]: props => (
        <ColorPicker {...props} />
    ),
    [FORM_OPTIONS.FONT]: props => (
        <div className="grid grid-cols-5 gap-1 w-full">
            {(props.values || []).map(font => (
                <div
                    key={font}
                    className={classNames({
                        "flex justify-center items-center rounded-md h-8 text-sm": true,
                        "bg-gray-900 text-white": props.theme === THEMES.LIGHT && font === props.value,
                        "bg-gray-600": props.theme === THEMES.DARK && font === props.value,
                        "hover:bg-gray-200 cursor-pointer": props.theme === THEMES.LIGHT && font !== props.value,
                        "hover:bg-gray-700 cursor-pointer": props.theme === THEMES.DARK && font !== props.value,
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
        <div className={props.className || "grid grid-cols-5 gap-1 w-full"}>
            {(props.values || []).map(item => {
                if (!checkIsVisible(item.value, props.value, props.isVisible, props.data)) {
                    return null;
                }
                const active = checkIsActive(item.value, props.value, props.isActive, props.data);
                const itemClass = classNames({
                    "flex flex-col justify-center items-center rounded-md py-2 grow": true,
                    "bg-neutral-900 text-white": props.theme === THEMES.LIGHT && active,
                    "bg-neutral-100 hover:bg-neutral-200 cursor-pointer": props.theme === THEMES.LIGHT && !active,
                    // "bg-gray-600": props.theme === THEMES.DARK && active,
                    // "hover:bg-gray-700 cursor-pointer": props.theme === THEMES.DARK && !active,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        {!!item.icon && (
                            <div className={classNames("flex items-center", item.iconClass)}>
                                {item.icon}
                            </div>
                        )}
                        {!!item.text && (
                            <div className={classNames("flex items-center", item.textClass)}>
                                <span className="font-bold text-xs">{item.text}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    ),
    [FORM_OPTIONS.COLOR_SELECT]: props => (
        <div className={props.className || "grid grid-cols-5 gap-1 w-full"}>
            {(props.values || []).map(value => (
                <div
                    key={value}
                    className={classNames({
                        "flex flex-col justify-center items-center rounded-md h-8 grow border": true,
                        "border-gray-300": props.theme === THEMES.LIGHT && value === props.value,
                        // "border-gray-300": props.theme === THEMES.DARK && value === props.value,
                        "border-gray-300 o-50 hover:o-100 cursor-pointer": props.theme === THEMES.LIGHT && value !== props.value,
                        // "o-30 hover:o-50 cursor-pointer": props.theme === THEMES.DARK && value !== props.value,
                    })}
                    style={{
                        backgroundColor: value,
                    }}
                    onClick={() => {
                        return props.onChange(value);
                    }}
                />
            ))}
        </div>
    ),
    [FORM_OPTIONS.LABELED_SELECT]: props => (
        <div className="flex flex-nowrap gap-1 w-full">
            {(props.values || []).map(item => {
                if (!checkIsVisible(item.value, props.value, props.isVisible, props.data)) {
                    return null;
                }
                const itemClass = classNames({
                    "flex flex-nowrap justify-center gap-1 items-center grow rounded-md h-8 px-1": true,
                    "bg-gray-900 text-white": props.theme === THEMES.LIGHT && item.value === props.value,
                    // "bg-gray-600": props.theme === THEMES.DARK && item.value === props.value,
                    "hover:bg-gray-200 cursor-pointer": props.theme === THEMES.LIGHT && item.value !== props.value,
                    // "hover:bg-gray-700 cursor-pointer": props.theme === THEMES.DARK && item.value !== props.value,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        <div className={classNames("flex items-center", item.iconClass)}>
                            {item.icon}
                        </div>
                        {!!item.label && (
                            <div className={classNames("flex items-center", item.labelClass)}>
                                <span className="text-2xs">{item.label}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    ),
    [FORM_OPTIONS.RANGE]: props => (
        <div className="flex items-center gap-2">
            {props.title && (
                <div className="text-xs w-16 shrink-0">{props.title}</div>
            )}
            <div className="flex items-center">
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
            <div className="flex items-center justify-between select-none">
                <div className="text-xs">{props.title}</div>
                <div className="text-lg cursor-pointer flex items-center" onClick={handleClick}>
                    {props.value ? <CheckSquareIcon /> : <SquareIcon />}
                </div>
            </div>
        );
    },
    [FORM_OPTIONS.PIXELS]: props => (
        <div className="flex items-center justify-between select-none">
            <div className="text-xs">
                <strong>{props.title}</strong>
            </div>
            <div className="flex items-center">
                <input
                    type="number"
                    className="w-full px-2 py-0 h-8 bg-white rounded-md outline-0 border border-gray-300 text-xs"
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
    [FORM_OPTIONS.SEPARATOR]: () => (
        <div className="w-full h-px bg-gray-500" />
    ),
};

export const Option = props => {
    const optionClassList = classNames({
        "text-neutral-700": props.theme === THEMES.LIGHT,
        // "text-white o-90": props.theme === THEMES.DARK,
    });
    return (
        <div className={optionClassList}>
            {(!optionsWithInlineTitle.has(props.type)) && !!props.title && (
                <div className="text-xs mb-1 select-none">
                    {props.title}
                </div>
            )}
            <div className="block">
                {optionTypes[props.type](props)}
            </div>
            {!!props.helper && (
                <div className="text-neutral-400 text-2xs mt-0 select-none">
                    {props.helper}
                </div>
            )}
        </div>
    );
};

// TODO: check the visible field of each item to decide if item should be visible
const getVisibleItems = (items, data) => {
    return Object.keys(items || {})
        .filter(key => {
            const item = items[key];
            if (typeof item.test === "function") {
                return !!item.test(data);
            }
            return true;
        });
};

export const Form = props => (
    <div className={props.className} style={props.style}>
        {getVisibleItems(props.items, props.data).map(key => (
            <React.Fragment key={key}>
                <Option
                    {...props.items[key]}
                    key={key}
                    field={key}
                    value={props.data?.[key] ?? null}
                    data={props.data ?? {}}
                    theme={props.theme}
                    onChange={value => props.onChange?.(key, value)}
                />
                {props.separator && (
                    <div className="last:hidden flex items-center justify-center">
                        {props.separator}
                    </div>
                )}
            </React.Fragment>
        ))}
    </div>
);

Form.defaultProps = {
    className: "flex flex-col gap-4",
    data: {},
    items: {},
    style: {},
    theme: THEMES.LIGHT,
    separator: null,
    onChange: null,
};
