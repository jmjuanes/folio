import React from "react";

import {MODES, ELEMENT_TYPES} from "../../constants.js";
import {Panel, PanelButton} from "./index.jsx";
import {
    ArrowsIcon,
    PointerIcon,
    SquareIcon,
    CircleIcon,
    LineIcon,
    PenIcon,
    TextIcon,
} from "../Icons.jsx";

const availableTypes = [
    {name: ELEMENT_TYPES.SHAPE_RECTANGLE, icon: SquareIcon()},
    {name: ELEMENT_TYPES.SHAPE_ELLIPSE, icon: CircleIcon()},
    {name: ELEMENT_TYPES.SHAPE_LINE, icon: LineIcon()},
    {name: ELEMENT_TYPES.TEXT, icon: TextIcon()},
    {name: ELEMENT_TYPES.HAND_DRAW, icon: PenIcon()},
];

export const ToolsPanel = props => (
    <Panel position="bottom-center">
        <PanelButton active={props.mode === MODES.MOVE} onClick={() => props.onModeChange(MODES.MOVE)}>
            <ArrowsIcon />
        </PanelButton>
        <PanelButton active={props.mode === MODES.SELECTION} onClick={() => props.onModeChange(MODES.SELECTION)}>
            <PointerIcon />
        </PanelButton>
        <div className="bg-gray-800 h-8" style={{width:"1px"}} />
        {availableTypes.map(item => {
            const isActive = props.type === item.name && props.mode === MODES.NONE;

            return (
                <PanelButton key={item.name} active={isActive} onClick={() => props.onTypeChange(item.name)}>
                    {item.icon}
                </PanelButton>
            );
        })}
    </Panel>
);

ToolsPanel.defaultProps = {
    mode: null,
    type: null,
    onModeChange: null,
    onTypeChange: null,
};
