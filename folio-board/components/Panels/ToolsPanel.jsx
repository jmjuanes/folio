import React from "react";
import {ACTIONS, ELEMENTS} from "../../constants.js";
import {Panel, PanelButton, PanelTextButton} from "./Panel.jsx";
import {
    ArrowsIcon,
    PointerIcon,
    RectangleIcon,
    ArrowIcon,
    TextIcon,
    PenIcon,
    ImageIcon,
} from "../icons/index.jsx";

export const ToolsPanel = props => (
    <Panel position="top-left">
        <PanelTextButton
            text="Drag"
            active={props.action === ACTIONS.MOVE}
            onClick={props.onMoveClick}
        >
            <ArrowsIcon />
        </PanelTextButton>
        <PanelTextButton
            text="Select"
            active={!props.tool && props.action !== ACTIONS.MOVE}
            onClick={props.onSelectionClick}
        >
            <PointerIcon />
        </PanelTextButton>
        <div
            className="bg-light-900 w-12"
            style={{
                height: "1px",
            }}
        />
        {/* Available tools */}
        <PanelTextButton text="Shape" active={props.tool === ELEMENTS.SHAPE} onClick={() => props.onToolClick(ELEMENTS.SHAPE)}>
            <RectangleIcon />
        </PanelTextButton>
        <PanelTextButton text="Arrow" active={props.tool === ELEMENTS.ARROW} onClick={() => props.onToolClick(ELEMENTS.ARROW)}>
            <ArrowIcon />
        </PanelTextButton>
        <PanelTextButton text="Text" active={props.tool === ELEMENTS.TEXT} onClick={() => props.onToolClick(ELEMENTS.TEXT)}>
            <TextIcon />
        </PanelTextButton>
        <PanelTextButton text="Image" active={props.tool === ELEMENTS.IMAGE} onClick={() => props.onToolClick(ELEMENTS.IMAGE)}>
            <ImageIcon />
        </PanelTextButton>
        <PanelTextButton text="Draw" active={props.tool === ELEMENTS.DRAW} onClick={() => props.onToolClick(ELEMENTS.DRAW)}>
            <PenIcon />
        </PanelTextButton>
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
