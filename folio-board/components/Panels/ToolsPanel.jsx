import React from "react";
import {ACTIONS} from "../../constants.js";
import {Panel, PanelButton} from "./Panel.jsx";
import {
    ArrowsIcon,
    PointerIcon,
} from "../Icons.jsx";

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
        {Object.keys(props.tools).map(key => {
            const tool = props.tools[key];
            return (
                <PanelButton key={key} active={props.currentTool === key} onClick={() => props.onToolClick(key)}>
                    <tool.Icon />
                </PanelButton>
            );
        })}
    </Panel>
);

ToolsPanel.defaultProps = {
    tools: {},
    currentAction: null,
    currentTool: null,
    onMoveClick: null,
    onSelectionClick: null,
    onToolClick: null,
};
