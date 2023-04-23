import React from "react";
import {Option} from "./Option.jsx";

// TODO: check the visible field of each item to decide if item should be visible
const getVisibleItems = (items, data) => {
    return Object.keys(items || {});
};

export const Form = props => (
    <div className={props.className} style={props.style}>
        {getVisibleItems(props.items, props.data).map(key => {
            const item = props.items[key];
            return React.createElement(Option, {
                ...item,
                key: key,
                field: key,
                value: props.data?.[key] || null,
                onChange: value => props.onChange?.(key, value),
            });
        })}
    </div>
);

Form.defaultProps = {
    className: "d-flex flex-col gap-4",
    data: {},
    items: {},
    style: {},
    onChange: null,
};
