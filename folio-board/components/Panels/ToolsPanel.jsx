import React from "react";
import {ELEMENTS} from "folio-core";
import {ACTIONS} from "../../constants.js";
import {Panel, PanelSeparator, PanelTextButton} from "./Panel.jsx";
import {
    // ArrowsIcon,
    HandGrabIcon,
    PointerIcon,
    RectangleIcon,
    ArrowIcon,
    TextIcon,
    PenIcon,
    ImageIcon,
} from "../icons/index.jsx";

export const ToolsPanel = props => (
    <Panel direction="col" className={props.className} style={props.style}>
        <PanelTextButton
            text="Drag"
            active={props.action === ACTIONS.MOVE}
            onClick={props.onMoveClick}
        >
            <HandGrabIcon />
        </PanelTextButton>
        <PanelTextButton
            text="Select"
            active={!props.tool && props.action !== ACTIONS.MOVE}
            onClick={props.onSelectionClick}
        >
            <PointerIcon />
        </PanelTextButton>
        <PanelSeparator />
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
    className: "top:0 left:0 pt:4 pl:4", 
    style: {},
    action: null,
    tool: null,
    // shape: null,
    onMoveClick: null,
    onSelectionClick: null,
    onToolClick: null,
};
