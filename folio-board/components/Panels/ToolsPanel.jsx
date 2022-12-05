import React from "react";
import {ACTIONS, ELEMENTS} from "../../constants.js";
import {Panel, PanelButton} from "./Panel.jsx";
import {
    ArrowsIcon,
    PointerIcon,
    RectangleToolIcon,
    CircleToolIcon,
    LineToolIcon,
} from "../icons/index.jsx";

const availableTools = [
    {
        element: ELEMENTS.RECTANGLE,
        Icon: RectangleToolIcon,
    },
    {
        element: ELEMENTS.ELLIPSE,
        Icon: CircleToolIcon,
    },
    {
        element: ELEMENTS.LINE,
        Icon: LineToolIcon,
    },
];

export const ToolsPanel = props => (
    <Panel position="bottom-center">
        <PanelButton
            active={props.action === ACTIONS.MOVE}
            onClick={props.onMoveClick}
        >
            <ArrowsIcon />
        </PanelButton>
        <PanelButton
            active={!props.tool && props.action !== ACTIONS.MOVE}
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
        {availableTools.map(tool => (
            <PanelButton
                key={tool.element}
                active={props.tool === tool.element}
                onClick={() => props.onToolClick(tool.element)}
            >
                <tool.Icon />
            </PanelButton>
        ))}
    </Panel>
);

ToolsPanel.defaultProps = {
    action: null,
    tool: null,
    onMoveClick: null,
    onSelectionClick: null,
    onToolClick: null,
};
