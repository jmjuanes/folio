import React from "react";
import {Button} from "./Button.js";
import ICONS from "../icons.js";

// Available types
const availableTypes = [
    {name: "selection", icon: ICONS.POINTER},
    {name: "rectangle", icon: ICONS.SQUARE},
    {name: "ellipse", icon: ICONS.CIRCLE},
    {name: "line", icon: ICONS.LINE},
    {name: "text", icon: ICONS.TEXT},
];

export const Toolbar = props => (
    <div
        className="is-absolute has-bottom-none has-left-half has-pb-4"
        style={{
            transform:"translateX(-50%)",
            zIndex: 100,
        }}
    >
        <div className="has-radius-md has-bg-white is-bordered has-p-2 is-flex has-shadow-lg">
            {availableTypes.map(item => (
                <Button
                    key={item.name}
                    className="has-ml-1"
                    active={props.currentType === item.name}
                    icon={item.icon}
                    onClick={() => props.onTypeChange(item.name)}
                />
            ))}
        </div>
    </div>
);
