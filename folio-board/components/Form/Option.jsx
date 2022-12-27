import React from "react";
import classNames from "classnames";
import backgroundImg from "./background.svg";

const optionTypes = {
    color: props => (
        <div className="d:grid gap:1 cols:5 w:full">
            {(props.values || []).map(item => (
                <div
                    key={item.value}
                    className={classNames({
                        "w:full h:full text:lg text:red-500": item.color === "transparent",
                        "p:4": item.color !== "transparent",
                        "d:flex items:center justify:center": true,
                        "b:1 b:solid r:md cursor:pointer": true,
                        "b:dark-100": item.value === props.value,
                        // "b:white": color !== props.value,
                        "b:light-200": item.value !== props.value,
                    })}
                    data-color={item.value}
                    style={{
                        backgroundColor: item.color !== "transparent" ? item.color : null,
                        backgroundImage: item.color === "transparent" ? `url('${backgroundImg}')` : null,
                        backgroundSize: "16px 16px",
                        backgroundRepeat: "repeat",
                        // cursor: "pointer",
                    }}
                    onClick={() => props.onChange(item.value)}
                />
            ))}
        </div>
    ),
    font: props => (
        <div className="d:flex gap:1 w:full">
            {(props.values || []).map(item => (
                <div
                    key={item.value}
                    className={classNames({
                        "d:flex justify:center items:center": true,
                        "r:md cursor:pointer p:2 w:full text:lg": true,
                        "bg:dark-700 text:white": item.value === props.value,
                    })}
                    style={{
                        fontFamily: item.font,
                    }}
                    onClick={() => props.onChange(item.value)}
                >
                    <strong>Aa</strong>
                </div>
            ))}
        </div>
    ),
    select: props => (
        <div className={`d:grid cols:${props.grid || "4"} gap:1 w:full`}>
            {(props.values || []).map(item => {
                const itemClass = classNames({
                    "d:flex justify:center items:center": true,
                    "r:md cursor:pointer p:2 w:full": true,
                    "text:lg": !!item.icon,
                    "font:bold": !!item.text,
                    "bg:dark-700 text:white": item.value === props.value,
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
        <div className="d:flex items:center gap:1">
            {props.prefix && (
                <div>{props.prefix}</div>
            )}
            <input
                type="text"
                className="w:full"
                placeholder={props.placeholder}
                onChange={e => props.onChange(e.target.value || "")}
                defaultValue={props.value}
            />
            {props.suffix && (
                <div>{props.suffix}</div>
            )}
        </div>
    ),
    range: props => (
        <div className="">
            <input
                type="range"
                className="m:0 w:full bg:light-900 h:1 mt:3 mb:2"
                onChange={e => props.onChange(e.target.value || 0)}
                defaultValue={props.value}
                min={props.minValue}
                max={props.maxValue}
                step={props.step}
            />
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
        <div className="mt:0 text:dark-700">
            <div style={wrapperStyle}>
                <div style={titleStyle}>{props.title}</div>
                <div style={contentStyle}>
                    {optionTypes[props.type](props)}
                </div>
            </div>
            {!!props.helper && (
                <div className="text:light-900 text:xs mt:0">
                    {props.helper}
                </div>
            )}
        </div>
    );
};
