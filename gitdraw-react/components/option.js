import React from "react";
import kofi from "kofi";

// Color parser
const parseColor = color => {
    return typeof color === "string" ? color : `rgb(${color.join(",")})`;
};

// Option types
const optionTypes = {
    color: props => (
        <div className="">
            {(props.theme.colors || []).map(color => {
                const classStyle = kofi.classNames({
                    // [style.item]: true,
                    // [style.transparent]: color === "transparent",
                });
                const style = {
                    backgroundColor: parseColor(color),
                    color: "white", // getTextColor(props.colors, null),
                };
                return (
                    <div
                        key={color}
                        className={classStyle}
                        onClick={() => props.onChange(color)}
                        style={style}
                    >
                        {kofi.when(color === props.value, () => (
                            <i className="icon-check" />
                        ))}
                    </div>
                );
            })}
        </div>
    ),
    font: props => (
        <div className="">
            {(props.theme.fonts || []).map(mame => {
                const classList = kofi.classNames("");
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
        <div className="">
            <input
                type="number"
                className="input"
                min={props.min || 0}
                max={props.max || null}
                step={props.step || 1}
                defaultValue={props.value}
                onChange={e => props.onChange(Math.max(0, Number(e.target.value)))}
            />
            <div className="">
                <strong>{props.suffix || "px"}</strong>
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
            <div className="has-size-0 has-text-gray-500 has-text-right has-minw-12">
                {props.format ? props.format(props.value) : props.value}
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
