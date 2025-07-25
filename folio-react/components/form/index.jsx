import React from "react";
import classNames from "classnames";
import {FORM_OPTIONS} from "../../constants.js";
import {ColorPicker} from "./color-picker.jsx";
import {FontPicker} from "./font-picker.jsx";

// Tiny utility to check if a value is active
export const checkIsActive = (value, currentValue, isActiveFn, data) => {
    if (typeof isActiveFn === "function") {
        return isActiveFn(value, currentValue, data);
    }
    // Other case, just check if value is the current value
    return value === currentValue;
};

// Tiny utility to check if a value is visible
export const checkIsVisible = (value, currentValue, isVisibleFn, data) => {
    if (typeof isVisibleFn === "function") {
        return !!isVisibleFn(value, currentValue, data);
    }
    // By default, item is visible
    return true;
};

const optionsWithInlineTitle = new Set([
    FORM_OPTIONS.CHECKBOX,
    FORM_OPTIONS.PIXELS,
    FORM_OPTIONS.RANGE,
    FORM_OPTIONS.SEPARATOR,
]);

const optionTypes = {
    [FORM_OPTIONS.COLOR]: props => (
        <ColorPicker {...props} />
    ),
    [FORM_OPTIONS.FONT]: props => (
        <FontPicker {...props} />
    ),
    [FORM_OPTIONS.SELECT]: props => (
        <div className={props.className || "grid grid-cols-5 gap-1 w-full"}>
            {(props.values || []).map(item => {
                if (!checkIsVisible(item.value, props.value, props.isVisible, props.data)) {
                    return null;
                }
                const active = checkIsActive(item.value, props.value, props.isActive, props.data);
                const itemClass = classNames({
                    "flex flex-col justify-center items-center rounded-md py-2 grow-1": true,
                    "cursor-pointer": !active,
                    "active bg-gray-900 text-white": active,
                    "bg-gray-100 hover:bg-gray-200": !active,
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
                        "flex flex-col justify-center items-center rounded-md h-8 grow-1": true,
                        "cursor-pointer": value !== props.value,
                        "active border-1 border-gray-300": value === props.value,
                        "border-1 border-gray-300 opacity-50 hover:opacity-100": value !== props.value,
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
                    "flex flex-nowrap justify-center gap-1 items-center grow-1 rounded-md h-8 px-1": true,
                    "cursor-pointer": item.value !== props.value,
                    "active bg-gray-900 text-white": item.value === props.value,
                    "bg-gray-100 hover:bg-gray-200": item.value !== props.value,
                    "cursor-not-allowed opacity-60": props.disabled,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => !props.disabled && props.onChange(item.value)}>
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
                <div className="text-xs w-16 shrink-0 font-medium">
                    {props.title}
                </div>
            )}
            <div className="flex items-center">
                <input
                    type="range"
                    className="m-0 w-full h-1 mt-3 mb-2 bg-gray-200"
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
        const inputClass = classNames({
            "cursor-pointer border-1 rounded-full p-px w-8 flex": true,
            "justify-end": !!props.value,
            "active bg-gray-900 border-gray-900": !!props.value,
            "bg-gray-200 border-gray-200": !props.value,
            "cursor-not-allowed opacity-60": props.disabled,
        });
        const handleClick = () => {
            return !props.disabled && props.onChange(!props.value);
        };
        return (
            <div className="flex items-center justify-between select-none">
                <div className="text-xs font-medium">
                    {props.title}
                </div>
                <div className={inputClass} onClick={handleClick}>
                    <div className="bg-white rounded-full w-4 h-4" />
                </div>
            </div>
        );
    },
    // [FORM_OPTIONS.PIXELS]: props => (
    //     <div className="flex items-center justify-between select-none">
    //         <div className="text-xs">
    //             <strong>{props.title}</strong>
    //         </div>
    //         <div className="flex items-center">
    //             <input
    //                 type="number"
    //                 className="w-full px-2 py-0 h-8 bg-white rounded-md outline-0 border-1 border-gray-300 text-xs"
    //                 defaultValue={props.value}
    //                 min={props.minValue}
    //                 max={props.maxValue}
    //                 style={{
    //                     fontFamily: "monospace",
    //                 }}
    //                 onChange={event => props.onChange(Number(event.target.value) ?? 0)}
    //             />
    //             <span className="text-xs pl-2">px</span>
    //         </div>
    //     </div>
    // ),
    [FORM_OPTIONS.IMAGE_SELECT]: props => (
        <div className={props.className || "grid grid-cols-5 gap-1 w-full"} style={props.style || {}}>
            {(props.values || []).map(item => {
                if (!checkIsVisible(item.value, props.value, props.isVisible, props.data)) {
                    return null;
                }
                const active = checkIsActive(item.value, props.value, props.isActive, props.data);
                const itemClass = classNames({
                    "flex flex-col justify-center items-center rounded-md py-0 grow-1": true,
                    "cursor-pointer": !active,
                    "active border-1 border-gray-900": active,
                    "border-1 border-gray-200 hover:bg-gray-200": !active,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        <img width="32px" height="32px" src={item.image} />
                    </div>
                );
            })}
        </div>
    ),
    [FORM_OPTIONS.TEXT]: props => (
        <input
            type="text"
            className={classNames({
                "w-full px-2 py-0 h-8 rounded-md outline-0 text-xs": true,
                "bg-white border-1 border-gray-200 text-gray-900": true,
            })}
            defaultValue={props.value}
            placeholder={props.placeholder}
            onChange={event => props.onChange(event.target.value)}
        />
    ),
    [FORM_OPTIONS.TEXTAREA]: props => (
        <textarea
            className={classNames({
                "w-full px-2 py-1 rounded-md outline-0 text-xs": true,
                "bg-white border-1 border-gray-200 text-gray-900": true,
            })}
            defaultValue={props.value}
            placeholder={props.placeholder}
            rows={props.rows ?? 3}
            onChange={event => props.onChange(event.target.value)}
        />
    ),
    [FORM_OPTIONS.CUSTOM]: props => {
        return props.render?.(props);
    },
    [FORM_OPTIONS.SEPARATOR]: () => (
        <div className="w-full h-px shrink-0 bg-gray-200" />
    ),
};

export const Option = props => (
    <div className="text-gray-900" data-testid="option">
        {(!optionsWithInlineTitle.has(props.type)) && !!props.title && (
            <div className="text-xs mb-1 select-none font-medium">
                {props.title}
            </div>
        )}
        <div className="block">
            {optionTypes[props.type](props)}
        </div>
        {!!props.helper && (
            <div className="text-2xs mt-0 select-none text-gray-600">
                {props.helper}
            </div>
        )}
    </div>
);

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
    <div data-testid="form" className={props.className || "flex flex-col gap-4"} style={props.style || {}}>
        {getVisibleItems(props.items, props.data).map(key => (
            <React.Fragment key={key}>
                <Option
                    {...props.items[key]}
                    key={key}
                    field={key}
                    value={props.data?.[key] ?? null}
                    data={props.data ?? {}}
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
