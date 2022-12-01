import React from "react";
import {ACTIONS, ELEMENTS} from "../../constants.js";
import {Panel, PanelButton} from "./Panel.jsx";
import {ArrowsIcon, PointerIcon, RectangleToolIcon} from "../icons/index.jsx";

const availableTools = [
    {
        element: ELEMENTS.RECTANGLE,
        Icon: RectangleToolIcon,
    }
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
        <div
            className="bg-gray-800 h-8"
            style={{
                width: "1px",
            }}
        />
        {props.tools.map(tool => (
            <PanelButton key={tool.element} active={props.currentTool === tool.element} onClick={() => props.onToolClick(tool.element)}>
                <tool.Icon />
            </PanelButton>
        ))}
    </Panel>
);

ToolsPanel.defaultProps = {
    tools: availableTools,
    currentAction: null,
    currentTool: null,
    onMoveClick: null,
    onSelectionClick: null,
    onToolClick: null,
};
