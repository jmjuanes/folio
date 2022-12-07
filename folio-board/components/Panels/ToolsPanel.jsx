import React from "react";
import {ACTIONS, ELEMENTS} from "../../constants.js";
import {Panel, PanelButton} from "./Panel.jsx";
import {
    ArrowsIcon,
    PointerIcon,
    RectangleToolIcon,
    CircleToolIcon,
    LineToolIcon,
    PenToolIcon,
} from "../icons/index.jsx";

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
        {/* Available tools */}
        <PanelButton active={props.tool === ELEMENTS.RECTANGLE} onClick={() => props.onToolClick(ELEMENTS.RECTANGLE)}>
            <RectangleToolIcon />
        </PanelButton>
        <PanelButton active={props.tool === ELEMENTS.ELLIPSE} onClick={() => props.onToolClick(ELEMENTS.ELLIPSE)}>
            <CircleToolIcon />
        </PanelButton>
        <PanelButton active={props.tool === ELEMENTS.LINE} onClick={() => props.onToolClick(ELEMENTS.LINE)}>
            <LineToolIcon />
        </PanelButton>
        <PanelButton active={props.tool === ELEMENTS.DRAW} onClick={() => props.onToolClick(ELEMENTS.DRAW)}>
            <PenToolIcon />
        </PanelButton>
    </Panel>
);

ToolsPanel.defaultProps = {
    action: null,
    tool: null,
    onMoveClick: null,
    onSelectionClick: null,
    onToolClick: null,
};
