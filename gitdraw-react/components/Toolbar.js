import React from "react";
import {Button} from "./Button.js";

// Available types
const availableTypes = [
    {name: "selection", icon: "pointer"},
    {name: "rectangle", icon: "square"},
    {name: "ellipse", icon: "circle"},
    {name: "line", icon: "minus"},
    {name: "text", icon: "text"},
];

export const Toolbar = props => (
    <div
        className="is-absolute has-bottom-none has-left-half has-pb-4"
        style={{transform:"translateX(-50%)"}}
    >
        <div className="has-radius-md has-bg-gray-100 has-p-2 is-flex">
            {availableTypes.map(item => (
                <Button
                    key={item.name}
                    className="has-ml-1"
                    active={props.currentType === item.name}
                    icon={item.icon}
                    onClick={() => props.onTypeChange(item.name)}
                />
            ))}
            <div className="has-bg-gray-200 has-mx-2" style={{width: "1px"}} />
            <Button
                className="has-ml-1"
                active={props.currentType === "screenshot"}
                icon="camera"
                onClick={() => props.onTypeChange("screenshot")}
            />
        </div>
    </div>
);
