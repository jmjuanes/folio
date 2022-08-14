import React from "react";

import {Button} from "./Button.js";
import ICONS from "../icons.js";
import {MODES, ELEMENT_TYPES} from "../constants.js";
import {css} from "../styles.js";

const toolbarWrapperClass = css({
    apply: "mixins.animations.bottom",
    bottom: "0px",
    left: "50%",
    paddingBottom: "1rem",
    position: "absolute",
    transform: "translateX(-50%)",
    zIndex: 100,
});

const toolbarClass = css({
    apply: "mixins.dialog",
    backgroundColor: "#fff",
    borderRadius: "0.5rem",
    display: "flex",
    gap: "0.25rem",
    padding: "0.5rem",
});

const separatorClass = css({
    backgroundColor: "primary",
    height: "2rem",
    marginLeft: "0.5rem",
    marginRight: "0.5rem",
    width: "0.125rem",
});

// Available types
const availableTypes = [
    {name: ELEMENT_TYPES.SHAPE_RECTANGLE, icon: ICONS.SQUARE},
    {name: ELEMENT_TYPES.SHAPE_ELLIPSE, icon: ICONS.CIRCLE},
    {name: ELEMENT_TYPES.SHAPE_LINE, icon: ICONS.LINE},
    {name: ELEMENT_TYPES.TEXT, icon: ICONS.TEXT},
    {name: ELEMENT_TYPES.HAND_DRAW, icon: ICONS.PEN},
];

export const Toolbar = props => (
    <div className={toolbarWrapperClass}>
        <div className={toolbarClass}>
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
            <div className={separatorClass} />
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
