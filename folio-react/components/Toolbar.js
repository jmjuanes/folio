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
            <Button
                className="has-ml-1"
                active={props.mode === MODES.MOVE}
                icon={ICONS.SLIDERS}
                onClick={() => props.onModeChange(MODES.MOVE)}
            />
            <Button
                className="has-ml-1"
                active={props.mode === MODES.SELECTION}
                icon={ICONS.POINTER}
                onClick={() => props.onModeChange(MODES.SELECTION)}
            />
            {availableTypes.map(item => (
                <Button
                    key={item.name}
                    className="has-ml-1"
                    active={props.type === item.name && props.mode === MODES.NONE}
                    icon={item.icon}
                    onClick={() => props.onTypeChange(item.name)}
                />
            ))}
        </div>
    </div>
);
