import React from "react";
import {Button} from "./Button.js";

// Available items
const availableItems = [
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
            {/* Selection */}
            <Button
                active={props.currentTool === "selection"}
                icon="pointer"
                onClick={() => props.onToolButtonClick("selection")}
            />
            {/* Available items */}
            {availableItems.map(item => (
                <Button
                    key={item.name}
                    className="has-ml-1"
                    active={props.currentTool === item.name}
                    icon={item.icon}
                    onClick={() => props.onToolButtonClick(item.name)}
                />
            ))}
            {/* Divider */}
            <div
                className="has-bg-gray-200 has-mx-2"
                style={{
                    width: "1px",
                }}
            />
            {/* Render grid option */}
            <Button
                className="has-ml-1"
                active={props.gridButtonActive}
                icon="grid"
                onClick={() => props.onGridButtonClick()}
            />
            {/* Render screenshot option */}
            <Button
                className="has-ml-1"
                active={props.currentTool === "screenshot"}
                icon="camera"
                onClick={() => props.onToolButtonClick("screenshot")}
            />
        </div>
    </div>
);
