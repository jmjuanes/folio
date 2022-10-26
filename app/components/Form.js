import React from "react";
import {Option} from "./Option.js";

export const Form = props => (
    <div style={props.style}>
        {Object.keys(props.items || {}).map(key => {
            const item = props.items[key];
            if (typeof item.visible === "boolean" && !item.visible) {
                return null;
            }
            return (
                <div key={key} style={{marginBottom:"0rem"}}>
                    <Option
                        {...item}
                        value={props.value[key]}
                        onChange={v => props.onChange && props.onChange(key, v)}
                    />
                </div>
            );
        })}
    </div>
);

Form.defaultProps = {
    value: {},
    items: {},
    style: {},
    onChange: null,
};
