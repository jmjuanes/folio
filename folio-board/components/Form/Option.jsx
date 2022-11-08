import React from "react";
import classNames from "classnames";

const optionTypes = {
    color: props => (
        <div className="d-grid gap-1 grid-cols-5 w-full mb-8">
            {Object.keys(props.values || {}).map(key => (
                <div
                    key={key}
                    className={classNames({
                        "b-1 b-solid r-md p-4": true,
                        "b-gray-900": key === props.value,
                    })}
                    style={{
                        backgroundColor: props.values[key][0],
                        cursor: "pointer",
                    }}
                    onClick={() => props.onChange(key)}
                />
            ))}
        </div>
    ),
    font: props => (
        <div className="">
            {Object.keys(props.values || {}).map(key => (
                <div
                    key={key}
                    className=""
                    style={{
                        fontFamily: props.values[key],
                    }}
                    onClick={() => props.onChange(key)}
                >
                    <strong>Aa</strong>
                </div>
            ))}
        </div>
    ),
    range: props => (
        <div className="d-flex items-center">
            <input
                className="w-full"
                type="range"
                onChange={e => props.onChange(Number(e.target.value))}
                min={props.domain[0] || 0}
                max={props.domain[1] || 1}
                step={props.step || 0.1}
                defaultValue={props.value}
            />
            <div className="text-sm text-center o-70" style={{minWidth:"2rem"}}>
                {props.value}
            </div>
        </div>
    ),
    select: props => (
        <div className="d-flex gap-1">
            {Object.keys(props.values).map(key => (
                <div
                    key={key}
                    className={classNames({
                        "d-flex justify-center items-center": true,
                        "r-md cursor-pointer text-lg h-20 p-4 w-full": true,
                        "bg-gray-900 text-white": key === props.value,
                    })}
                    onClick={() => props.onChange(key)}
                >
                    {props.values[key]}
                </div>
            ))}
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
        <div className="mb-4">
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
