import React from "react";

export const ImagePicker = props => (
    <div className={props.className || "grid grid-cols-5 gap-1 w-full"} style={props.style || {}}>
        {(props.values || []).map(item => {
            if (!checkIsVisible(item.value, props.value, props.isVisible, props.data)) {
                return null;
            }
            const active = checkIsActive(item.value, props.value, props.isActive, props.data);
            const itemClass = classNames({
                "flex flex-col justify-center items-center rounded-md py-0 grow": true,
                "bg-neutral-900 text-white": active,
                "bg-neutral-100 hover:bg-neutral-200 cursor-pointer": !active,
            });
            return (
                <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                    <img width="32px" height="32px" src={item.image} />
                </div>
            );
        })}
    </div>
);
