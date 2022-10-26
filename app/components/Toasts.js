import React from "react";
import {styled} from "@siimple/react";
import {Elements} from "@siimple/components";

const ToastsWrapper = styled("div", {
    left: "50%",
    maxWidth: "500px",
    position: "absolute",
    top: "0px",
    transform: "translateX(-50%)",
    width: "100%",
    zIndex: "500",
});

// Toast child
const Toast = props => {
    const timer = React.useRef(null);
    React.useEffect(() => {
        if (props.autoDelete && props.autoDeleteTime > 0) {
            timer.current = setTimeout(() => props.onDelete(), props.autoDeleteTime);
        }
    }, []);
    return (
        <Elements.alert>
            <div style={{marginRight:"1rem"}}>{props.message}</div>
            <Elements.close
                style={{
                    marginLeft: "auto",
                }}
                onClick={() => {
                    clearTimeout(timer.current);
                    props.onDelete();
                }}
            />
        </Elements.alert>
    );
};

export const Toasts = props => (
    <ToastsWrapper>
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
    </ToastsWrapper>
);

Toasts.defaultProps = {
    items: [],
    autoDelete: true,
    autoDeleteTime: 6000,
};
