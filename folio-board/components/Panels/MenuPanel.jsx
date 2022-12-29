import React from "react";
import classNames from "classnames";
import {Panel, PanelButton} from "./Panel.jsx";
import {MenuIcon} from "../icons/index.jsx";

export const MenuPanel = props => (
    <Panel className={classNames("top:0 left:0 pt:4 pl:4", props.className)}>
        {props.showHome && (
            <PanelButton onClick={props.onHomeClick}>
                <MenuIcon />
            </PanelButton>
        )}
        {props.showHome && props.showTitle && (
            <div className="bg:light-900 h:6 w:px" />
        )}
        {props.showTitle && (
            <div className="d:flex items:center justify:center select:none px:2">
                <span className="font:bold text:base">{props.title}</span>
            </div>
        )}
    </Panel>
);

MenuPanel.defaultProps = {
    className: "",
    title: "",
    showTitle: true,
    showHome: true,
    onHomeClick: null,
};
