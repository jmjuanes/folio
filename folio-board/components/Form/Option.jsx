import React from "react";
import classNames from "classnames";

const optionTypes = {
    color: props => (
        <div className="d-grid gap-1 grid-cols-5 w-full">
            {(props.values || []).map(color => (
                <div
                    key={color}
                    className={classNames({
                        "b-2 b-solid r-md p-4": true,
                        "b-gray-900": color === props.value,
                        "b-white": color !== props.value,
                    })}
                    style={{
                        backgroundColor: color,
                        cursor: "pointer",
                    }}
                    onClick={() => props.onChange(color)}
                />
            ))}
        </div>
    ),
    font: props => (
        <div className="d-flex gap-1 w-full">
            {(props.values || []).map(value => {
                const itemClass = classNames({
                    "d-flex justify-center items-center": true,
                    "r-md cursor-pointer p-2 w-full text-lg": true,
                    "bg-gray-900 text-white": value === props.value,
                });
                const itemStyle = {
                    fontFamily: value,
                };
                return (
                    <div key={value} className={itemClass} style={itemStyle} onClick={() => props.onChange(value)}>
                        <strong>Aa</strong>
                    </div>
                );
            })}
        </div>
    ),
    select: props => (
        <div className="d-flex gap-1">
            {(props.values || []).map(item => {
                const itemClass = classNames({
                    "d-flex justify-center items-center": true,
                    "r-md cursor-pointer p-2 w-full": true,
                    "text-lg": !!item.icon,
                    "font-bold": !!item.text,
                    "bg-gray-900 text-white": item.value === props.value,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        {item.icon || item.text}
                    </div>
                );
            })}
        </div>
    ),
    switch: props => (
        <input
            type="checkbox"
            onChange={e => props.onChange(e.target.checked)}
            defaultChecked={!!props.value}
        />
    ),
    input: props => (
        <div className="d-flex items-center gap-1">
            {props.prefix && (
                <div>{props.prefix}</div>
            )}
            <input
                type="text"
                className="w-full"
                placeholder={props.placeholder}
                onChange={e => props.onChange(e.target.value || "")}
                defaultValue={props.value}
            />
            {props.suffix && (
                <div>{props.suffix}</div>
            )}
        </div>
    ),
};

export const Option = props => {
    const isInline = props.type === "switch";
    const wrapperStyle = {
        alignItems: "center",
        display: isInline ? "flex" : "block",
    };
    const titleStyle = {
        fontSize: "0.875rem",
        fontWeight: "bold",
        marginBottom: isInline ? "0px" : "0.5rem",
    };
    const contentStyle = {
        marginLeft: isInline ? "auto" : "0px",
    };
    return (
        <div className="mt-4">
            <div style={wrapperStyle}>
                <div style={titleStyle}>{props.title}</div>
                <div style={contentStyle}>
                    {optionTypes[props.type](props)}
                </div>
            </div>
            {!!props.helper && (
                <div className="text-gray-700 text-xs mt-0">
                    {props.helper}
                </div>
            )}
        </div>
    );
};
