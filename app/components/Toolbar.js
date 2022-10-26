import React from "react";

import {Button} from "./Button.js";
import ICONS from "../icons.js";
import {MODES, ELEMENT_TYPES} from "../constants.js";

// Available types
const availableTypes = [
    {name: ELEMENT_TYPES.SHAPE_RECTANGLE, icon: ICONS.SQUARE},
    {name: ELEMENT_TYPES.SHAPE_ELLIPSE, icon: ICONS.CIRCLE},
    {name: ELEMENT_TYPES.SHAPE_LINE, icon: ICONS.LINE},
    {name: ELEMENT_TYPES.TEXT, icon: ICONS.TEXT},
    {name: ELEMENT_TYPES.HAND_DRAW, icon: ICONS.PEN},
];

export const Toolbar = props => (
    <div className="bottom-0 left-half pb-8 position-absolute z-10" style={{transform:"translateX(-50%)"}}>
        <div className="shadow-md b-solid b-1 b-gray-900 bg-white d-flex gap-1 p-4">
            <Button
                active={props.mode === MODES.MOVE}
                icon={ICONS.ARROWS}
                onClick={() => props.onModeChange(MODES.MOVE)}
            />
            <Button
                active={props.mode === MODES.SELECTION}
                icon={ICONS.POINTER}
                onClick={() => props.onModeChange(MODES.SELECTION)}
            />
            <div className="bg-gray-500 h-16 ml-4 mr-4 w-1" />
            {availableTypes.map(item => (
                <Button
                    key={item.name}
                    active={props.type === item.name && props.mode === MODES.NONE}
                    icon={item.icon}
                    onClick={() => props.onTypeChange(item.name)}
                />
            ))}
        </div>
    </div>
);
