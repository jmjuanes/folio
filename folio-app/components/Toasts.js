import React from "react";
import {classNames} from "../utils/classNames.js";

// Toast child
const Toast = props => {
    const timer = React.useRef(null);
    React.useEffect(() => {
        if (props.autoDelete && props.autoDeleteTime > 0) {
            timer.current = setTimeout(() => props.onDelete(), props.autoDeleteTime);
        }
    }, []);
    const classList = classNames([
        "alert is-flex has-mb-0 has-mt-2",
        props.type === "error" && "has-bg-error",
        props.type === "warning" && "has-bg-primary",
        props.type === "success" && "has-bg-success",
    ]);

    return (
        <div className={classList}>
            <div className="has-mr-4">{props.message}</div>
            <div
                className="close has-ml-auto"
                onClick={() => {
                    clearTimeout(timer.current);
                    props.onDelete();
                }}
            />
        </div>
    );
};

export const Toasts = props => (
    <div className="is-absolute has-bottom-none has-right-none has-mr-4 has-mb-4 has-w-96" style={{zIndex:500}}>
        {props.items.map(item => (
            <Toast
                key={item.id}
                type={item.type}
                message={item.message}
                autoDelete={props.autoDelete}
                autoDeleteTime={props.autoDeleteTime}
                onDelete={() => props.onDelete(item.id)}
            />
        ))}
    </div>
);

Toasts.defaultProps = {
    items: [],
    autoDelete: true,
    autoDeleteTime: 6000,
};
