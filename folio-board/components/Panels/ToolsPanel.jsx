import React from "react";
import {ACTIONS, ELEMENTS} from "../../constants.js";
import {Panel, PanelButton} from "./Panel.jsx";
import {
    ArrowsIcon,
    PointerIcon,
    RectangleIcon,
    ArrowIcon,
    TextIcon,
    PenIcon,
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
        <PanelButton active={props.tool === ELEMENTS.SHAPE} onClick={() => props.onToolClick(ELEMENTS.SHAPE)}>
            <RectangleIcon />
        </PanelButton>
        <PanelButton active={props.tool === ELEMENTS.ARROW} onClick={() => props.onToolClick(ELEMENTS.ARROW)}>
            <ArrowIcon />
        </PanelButton>
        <PanelButton active={props.tool === ELEMENTS.TEXT} onClick={() => props.onToolClick(ELEMENTS.TEXT)}>
            <TextIcon />
        </PanelButton>
        <PanelButton active={props.tool === ELEMENTS.DRAW} onClick={() => props.onToolClick(ELEMENTS.DRAW)}>
            <PenIcon />
        </PanelButton>
    </Panel>
);

ToolsPanel.defaultProps = {
    action: null,
    tool: null,
    // shape: null,
    onMoveClick: null,
    onSelectionClick: null,
    onToolClick: null,
};
