import React from "react";

import {Option} from "./Option.jsx";

export const Form = props => (
    <div className={props.className} style={props.style}>
        {Object.keys(props.items || {}).map(key => {
            const item = props.items[key];
            const value = props.data?.[key] || null;
            if (typeof item.visible !== "undefined") {
                if (typeof item.visible === "function" && !item.visible(value, data)) {
                    return null;
                }
                else if (!item.visible) {
                    return null;
                }
            }
            return (
                <div className="mb-0" key={key}>
                    <Option
                        {...item}
                        value={value}
                        onChange={v => props.onChange(key, v)}
                    />
                </div>
            );
        })}
    </div>
);

Form.defaultProps = {
    className: "",
    data: {},
    items: {},
    style: {},
    onChange: null,
};
