import React from "react";
import classNames from "classnames";
import {Panel, PanelButton} from "./Panel.jsx";
import {MenuIcon, SaveIcon, TrashIcon} from "../icons/index.jsx";

export const MenuPanel = props => (
    <Panel className={classNames("top:0 left:0 pt:4 pl:4", props.className)}>
        {props.showMenu && (
            <React.Fragment>
                <PanelButton active={props.menuActive} onClick={props.onMenuClick}>
                    <MenuIcon />
                </PanelButton>
                <div className="bg:light-900 h:6 w:px" />
            </React.Fragment>
        )}
        <div className="d:flex items:center justify:center select:none px:2">
            <span className="font:bold text:base">{props.title || "Untitled"}</span>
        </div>
        {props.showSave && (
            <PanelButton onClick={props.onSaveClick}>
                <SaveIcon />
            </PanelButton>
        )}
        {props.showClear && (
            <PanelButton onClick={props.onClearClick}>
                <TrashIcon />
            </PanelButton>
        )}
    </Panel>
);

MenuPanel.defaultProps = {
    className: "",
    title: "",
    menuActive: false,
    clearActive: false,
    saveActive: false,
    showMenu: true,
    showClear: true,
    showSave: true,
    onMenuClick: null,
    onSaveClick: null,
    onClearClick: null,
};
