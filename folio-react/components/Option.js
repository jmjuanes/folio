import React from "react";
import {classNames} from "@siimple/styled";

import {hexToRgb, rgbToHex, isValidHexColor} from "../utils/colors.js";
import {css, elements} from "../styles.js";

const colorsListClass = css({
    display: "grid",
    gridGap: "0.125rem",
    gridTemplateColumns: "repeat(5, auto)",
    width: "100%",
});
const colorsItemClass = css({
    apply: "mixins.bordered",
    borderRadius: "0.5rem",
    height: "2rem",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    // width: "100%",
});
const colorsWrapperClass = css({
    apply: "mixins.bordered",
    alignItems: "center",
    backgroundColor: "primary",
    display: "flex",
    height: "2rem",
    overflow: "hidden",
});
const colorsValueClass = css({
    alignItems: "center",
    // backgroundColor: "primary",
    color: "#fff",
    display: "flex",
    fontWeight: "bold",
    height: "2rem",
    lineHeight: "1.5",
    paddingBottom: "0.25rem",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    paddingTop: "0.25rem",
});
const colorsInputClass = css({
    backgroundColor: "#fff",
    border: "0px",
    borderRadius: "0px",
    fontFamily: "monospace",
    fontSize: "0.875rem",
    height: "2rem",
    padding: "0.25rem 0.5rem",
    width: "100%",
    outline: "none",
});

const selectClass = css({
    apply: "mixins.bordered",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "1.25rem",
    padding: "0.25rem",
    textAlign: "center",
    width: "100%",
    "&:hover,&.is-active": {
        backgroundColor: "primary",
        color: "#fff",
    },
});

const rangeValueClass = css({
    fontSize: "0.875rem",
    minWidth: "2rem",
    opacity: 0.75,
    textAlign: "right",
});

const optionTypes = {
    color: props => {
        const colorRef = React.useRef(null);
        return (
            <div style={{marginBottom: "1rem"}}>
                <div style={{display: "flex", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem"}}>
                    <div
                        className={colorsItemClass}
                        style={{
                            backgroundColor: rgbToHex(props.value),
                            flexGrow: "0",
                            maxWidth: "2rem",
                        }}
                    />
                    <div className={colorsWrapperClass}>
                        <div className={colorsValueClass}>#</div>
                        <input
                            ref={colorRef}
                            type="text"
                            className={colorsInputClass}
                            onChange={e => {
                                if (isValidHexColor(e.target.value.replace("#", ""))) {
                                    return props.onChange(hexToRgb(e.target.value));
                                }
                            }}
                            defaultValue={rgbToHex(props.value).replace("#", "")}
                        />
                    </div>
                </div>
                <div className={colorsListClass}>
                    {(props.colors || []).map(value => (
                        <div
                            key={value}
                            className={colorsItemClass}
                            style={{
                                backgroundColor: rgbToHex(value),
                                cursor: "pointer",
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
        <div style={{display:"flex",alignItems:"center"}}>
            <input
                type="range"
                className={elements.slider}
                onChange={e => props.onChange(Number(e.target.value))}
                min={props.domain[0] || 0}
                max={props.domain[1] || 1}
                step={props.step || 0.1}
                defaultValue={props.value}
            />
            <div className={rangeValueClass}>
                {props.value}
            </div>
        </div>
    ),
    select: props => (
        <div style={{display: "flex", gap:"0.25rem"}}>
            {Object.keys(props.values).map(key => {
                const classList = classNames({
                    [selectClass]: true,
                    "is-active": key === props.value,
                });
                return (
                    <div key={key} className={classList} onClick={() => props.onChange(key)}>
                        {props.values[key]}
                    </div>
                );
            })}
        </div>
    ),
    switch: props => (
        <input
            type="checkbox"
            className={elements.switch}
            onChange={e => props.onChange(e.target.checked)}
            defaultChecked={!!props.value}
        />
    ),
};

const optionTitleClass = css({
    fontSize: "0.875rem",
    fontWeight: "bold",
    // marginBottom: "0.5rem",
});
// const optionContentClass = css({
//     // marginBottom: "0.5rem",
// });

// Option wrapper
export const Option = props => {
    const isInline = props.type === "switch";
    const wrapperStyle = {
        alignItems: "center",
        display: isInline ? "flex" : "block",
        marginBottom: "0.5rem",
    };
    const titleStyle = {
        marginBottom: isInline ? "0px" : "0.5rem",
    };
    const contentStyle = {
        marginLeft: isInline ? "auto" : "0px",
        // marginBottom: isInline ? "0px" : "0.5rem",
    };
    return (
        <div style={wrapperStyle}>
            <div className={optionTitleClass} style={titleStyle}>{props.title}</div>
            <div style={contentStyle}>
                {optionTypes[props.type](props)}
            </div>
        </div>
    );
};
