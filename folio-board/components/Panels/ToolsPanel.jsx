import React from "react";
import {TOOLS} from "folio-core";
import {ACTIONS} from "../../constants.js";
import {Panel, PanelButton} from "./Panel.jsx";
import {
    ArrowsIcon,
    PointerIcon,
    SquareIcon,
    CircleIcon,
    LineIcon,
    PenIcon,
    TextIcon,
} from "../Icons.jsx";

const availableTools = [
    {name: TOOLS.RECTANGLE, icon: SquareIcon()},
    {name: TOOLS.ELLIPSE, icon: CircleIcon()},
    {name: TOOLS.LINE, icon: LineIcon()},
    {name: TOOLS.TEXT, icon: TextIcon()},
    {name: TOOLS.HAND_DRAW, icon: PenIcon()},
];

export const ToolsPanel = props => (
    <Panel position="bottom-center">
        <PanelButton
            active={props.currentAction === ACTIONS.MOVE}
            onClick={props.onMoveClick}
        >
            <ArrowsIcon />
        </PanelButton>
        <PanelButton
            active={!props.currentTool && props.currentAction !== ACTIONS.MOVE}
            onClick={props.onSelectionClick}
        >
            <PointerIcon />
        </PanelButton>
        <div className="bg-gray-800 h-8" style={{width:"1px"}} />
        {availableTools.map(({name, icon}) => (
            <PanelButton key={name} active={props.currentTool === name} onClick={() => props.onToolClick(name)}>
                {icon}
            </PanelButton>
        ))}
    </Panel>
);

ToolsPanel.defaultProps = {
    currentAction: null,
    currentTool: null,
    onMoveClick: null,
    onSelectionClick: null,
    onToolClick: null,
};
