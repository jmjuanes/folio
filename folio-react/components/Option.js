import React from "react";
import {hexToRgb, rgbToHex, isValidHexColor} from "../utils/colors.js";
import {classNames} from "../utils/classNames.js";

// Option types
const optionTypes = {
    color: props => {
        const colorRef = React.useRef(null);
        return (
            <div className="has-mb-4">
                <div className="is-flex has-items-center has-mb-2">
                    <div
                        className="has-radius-md has-mr-2 has-w-full has-maxw-8 has-p-4 is-bordered"
                        style={{
                            backgroundColor: rgbToHex(props.value),
                        }}
                    />
                    <div className="is-flex has-radius-md is-clipped has-bg-white is-bordered has-items-center">
                        <div className="has-bg-muted has-px-2 has-py-1 has-lh-normal">
                            <strong>#</strong>
                        </div>
                        <input
                            ref={colorRef}
                            type="text"
                            className="input has-bg-white is-radiusless has-size-0 has-px-2 has-py-1"
                            onChange={e => {
                                if (isValidHexColor(e.target.value.replace("#", ""))) {
                                    return props.onChange(hexToRgb(e.target.value));
                                }
                            }}
                            defaultValue={rgbToHex(props.value).replace("#", "")}
                        />
                    </div>
                </div>
                <div
                    className="has-w-full"
                    style={{
                        display: "grid",
                        gridGap: "0.125rem",
                        gridTemplateColumns: "repeat(5, auto)",
                    }}
                >
                    {(props.colors || []).map(value => (
                        <div
                            key={value}
                            className="has-radius-md has-py-4 is-clickable is-bordered"
                            style={{
                                backgroundColor: rgbToHex(value),
                            }}
                            onClick={() => {
                                props.onChange(value);
                                colorRef.current.value = rgbToHex(value).replace("#", "");
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    },
    font: props => (
        <div className="">
            {(props.theme.fonts || []).map(mame => {
                const classList = classNames([]);
                const style = {
                    fontFamily: name,
                };
                return (
                    <div
                        key={name}
                        className={classList}
                        onClick={() => props.onChange(name)}
                        style={style}
                    >
                        <strong>ab</strong>
                    </div>
                );
            })}
        </div>
    ),
    pair: props => (
        <div className="">
            <input
                type="number"
                className="input"
                step={props.steps?.[0] || 1}
                onChange={e => props.onChange(props.keys[0], e.target.value)}
                defaultValue={props.values[0]}
            />
            <div className="">
                {props.separator || "x"}
            </div>
            <input
                type="number"
                className="input"
                step={props.steps?.[1] || 1}
                onChange={e => props.onChange(props.keys[1], e.target.value)}
                defaultValue={props.values[1]}
            />
        </div>
    ),
    pixel: props => (
        <div className="is-flex has-radius-md is-clipped has-bg-white is-bordered has-items-center">
            <input
                type="number"
                className="has-bg-white has-size-0 has-px-2 has-py-1 has-w-full has-text-right"
                defaultValue={props.value}
                min={props.min || 0}
                max={props.max || null}
                step="1"
                style={{
                    border: "0px solid transparent",
                    outline: "none",
                }}
                onChange={e => props.onChange(Math.max(props.min || 0, Number(e.target.value)))}
            />
            <div className="has-bg-muted has-px-2 has-py-1 has-lh-normal">
                <strong>px</strong>
            </div>
        </div>
    ),
    range: props => (
        <div className="is-flex">
            <input
                type="range"
                className="slider"
                onChange={e => props.onChange(Number(e.target.value))}
                min={props.domain[0] || 0}
                max={props.domain[1] || 1}
                step={props.step || 0.1}
                defaultValue={props.value}
            />
            <div className="has-size-0 has-opacity-75 has-text-right has-minw-8">
                {props.value}
            </div>
        </div>
    ),
    select: props => (
        <select
            className="select has-minh-auto has-p-2 has-size-0"
            defaultValue={props.value}
            onChange={e => props.onChange(e.target.value)}
        >
            {(props.values || []).map(value => (
                <option key={value} value={value}>{value}</option>
            ))}
        </select>
    ),
    selectIcon: props => (
        <div className="is-flex" style={{gap:"0.25rem"}}>
            {Object.keys(props.values).map(key => {
                const classList = classNames([
                    "has-p-1 has-size-2 has-radius-md",
                    "is-clickable has-w-full has-text-center is-bordered",
                    key !== props.value && "has-bg-body-hover has-text-white-hover", 
                    key === props.value && "has-bg-body has-text-white",
                ]);
                return (
                    <div key={key} className={classList} onClick={() => props.onChange(key)}>
                        {props.values[key]}
                    </div>
                );
            })}
        </div>
    ),
    switch: props => (
        <div className="is-flex">
            <div className="has-size-0 has-text-gray-500 has-weight-bold">Off</div>
            <div className="has-w-full" align="center">
                <input
                    type="checkbox"
                    className="switch"
                    onChange={e => props.onChange(e.target.checked)}
                    defaultChecked={!!props.value}
                />
            </div>
            <div className="has-size-0 has-text-gray-500 has-weight-bold">On</div>
        </div>
    ),
    text: props => (
        <textarea
            className="textarea has-bg-white has-mb-0 has-size-0"
            rows="3"
            defaultValue={props.value}
            onChange={e => props.onChange(e.target.value)}
        />
    ),
};

// Option wrapper
export const Option = props => (
    <div className="">
        <div className="has-weight-bold has-size-0 has-mb-2">{props.title}</div>
        <div className="has-mb-2">
            {optionTypes[props.type](props)}
        </div>
    </div>
);
