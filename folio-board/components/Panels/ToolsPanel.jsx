import React from "react";
import {TOOLS} from "folio-renderer";
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
        <PanelButton active={false} onClick={() => null}>
            <ArrowsIcon />
        </PanelButton>
        <PanelButton active={!props.activeTool} onClick={() => props.onToolChange(null)}>
            <PointerIcon />
        </PanelButton>
        <div className="bg-gray-800 h-8" style={{width:"1px"}} />
        {availableTools.map(item => {
            const isActive = props.activeTool === item.name;;

            return (
                <PanelButton key={item.name} active={isActive} onClick={() => props.onToolChange(item.name)}>
                    {item.icon}
                </PanelButton>
            );
        })}
    </Panel>
);

ToolsPanel.defaultProps = {
    activeAction: null,
    activeTool: null,
    onModeChange: null,
    onToolChange: null,
};
