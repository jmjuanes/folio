import React from "react";
import {Button} from "./button.js";

// Available items
const availableItems = [
    {name: "selection", icon: "pointer"},
    {name: "rectangle", icon: "square"},
    {name: "ellipse", icon: "circle"},
    {name: "line", icon: "minus"},
    // {name: "arrow", icon: "arrow-right"},
    {name: "text", icon: "text"},
];

export const Toolbar = props => (
    <div className="is-absolute has-bottom-none has-left-half has-pb-4" style={{transform:"translateX(-50%)"}}>
        <div className="has-radius-md has-bg-gray-100 has-p-2 is-flex">
            {/* Available items */}
            {availableItems.map(item => (
                <Button
                    key={item.name}
                    className=""
                    active={props.currentElement === item.name}
                    icon={item.icon}
                    onClick={() => props.onElementClick(item.name)}
                />
            ))}
            {/* Divider */}
            <div className="" />
            {/* Render grid option */}
            <Button
                className=""
                active={props.isGridActive}
                icon="grid"
                onClick={() => props.onGridClick()}
            />
            {/* Render screenshot option */}
            <Button
                className=""
                active={props.currentElement === "screenshot"}
                icon="camera"
                onClick={() => props.onElementClick("screenshot")}
            />
        </div>
    </div>
);
