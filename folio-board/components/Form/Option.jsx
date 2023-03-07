import React from "react";
import classNames from "classnames";
import {COLORS} from "folio-core";

const transparent = window.encodeURIComponent([
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#fdfdfd">`,
    `<rect x="0" y="0" width="8" height="8" fill="#cacacc" />`,
    `<rect x="8" y="8" width="8" height="8" fill="#cacacc" />`,
    `</svg>`,
].join(""));

const optionTypes = {
    color: props => (
        <div className="w:full">
            <div className="d:flex items:center gap:1 w:full mb:2">
                <div
                    className="d:flex r:md h:8 w:8 b:1 b:solid b:gray-300"
                    style={{
                        backgroundColor: props.value !== "transparent" ? props.value : null,
                        backgroundImage: props.value === "transparent" ? `url('data:image/svg+xml;utf-8,${transparent}')` : null,
                        backgroundSize: "10px 10px",
                        backgroundRepeat: "repeat",
                        minWidth: "2rem",
                    }}
                />
                <input
                    type="text"
                    data-field={props.field}
                    className="w:full px:2 py:0 h:8 bg:white r:md outline:0 b:1 b:solid b:gray-300 text:xs"
                    defaultValue={props.value}
                    style={{
                        fontFamily: "monospace",
                    }}
                    onChange={event => props.onChange(event.target.value || COLORS.BLACK)}
                />
            </div>
            <div className="d:grid gap:1 cols:5 w:full">
                {(props.values || []).map(color => (
                    <div
                        key={color}
                        className="d:flex w:8 h:8 r:md cursor:pointer b:1 b:solid b:gray-300"
                        style={{
                            backgroundColor: color !== "transparent" ? color : null,
                            backgroundImage: color === "transparent" ? `url('data:image/svg+xml;utf-8,${transparent}')` : null,
                            backgroundSize: "10px 10px",
                            backgroundRepeat: "repeat",
                        }}
                        onClick={() => {
                            // Terrible hack to change the input color
                            document.querySelector(`input[data-field="${props.field}"]`).value = color;
                            props.onChange(color);
                        }}
                    />
                ))}
            </div>
        </div>
    ),
    font: props => (
        <div className="d:grid cols:4 gap:1 w:full">
            {(props.values || []).map(font => (
                <div
                    key={font}
                    className={classNames({
                        "d:flex justify:center items:center": true,
                        "r:md cursor:pointer w:10 h:10 text:md": true,
                        "bg:gray-800 text:white": font === props.value,
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
        <div className={`d:grid cols:${props.grid || "4"} gap:1 w:full`}>
            {(props.values || []).map(item => {
                const itemClass = classNames({
                    "d:flex flex:col justify:center items:center": true,
                    "r:md cursor:pointer w:10 h:10": true,
                    "bg:gray-800 text:white": item.value === props.value,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        {!!item.icon && (
                            <div className={classNames("d:flex items:center text:lg", item.iconClass)}>
                                {item.icon}
                            </div>
                        )}
                        {!!item.text && (
                            <div className={classNames("d:flex items:center", item.textClass)}>
                                <span className="font:bold">{item.text}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    ),
    checkbox: props => (
        <input
            type="checkbox"
            className="r:sm b:dark-700 b:solid b:2"
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
                className="w:full px:4 b:0 r:md"
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
                className="m:0 w:full bg:gray-300 h:1 mt:3 mb:2"
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
    const isInline = props.type === "checkbox";
    const wrapperStyle = {
        alignItems: "center",
        display: isInline ? "flex" : "block",
    };
    const titleStyle = {
        fontSize: "0.75rem",
        fontWeight: "bold",
        marginBottom: isInline ? "0px" : "0.5rem",
    };
    const contentStyle = {
        marginLeft: isInline ? "auto" : "0px",
    };
    return (
        <div className="mt:0 text:gray-700">
            <div style={wrapperStyle}>
                <div style={titleStyle}>{props.title}</div>
                <div style={contentStyle}>
                    {optionTypes[props.type](props)}
                </div>
            </div>
            {!!props.helper && (
                <div className="text:gray-400 text:2xs mt:0">
                    {props.helper}
                </div>
            )}
        </div>
    );
};
