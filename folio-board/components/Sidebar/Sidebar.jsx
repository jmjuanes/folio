import React from "react"
import classNames from "classnames";
import {CloseIcon} from "../icons/index.jsx";
import {DefaultButton} from "../Buttons/index.jsx";

export const Sidebar = props => (
    <div className={classNames("d:flex flex:col h:full", props.className)}>
        {props.children}
    </div>
);

Sidebar.defaultProps = {
    className: "w:96 bg:light-300",
};

export const SidebarContent = props => (
    <div className="h:full p:8 overflow-y:auto">
        {props.children}
    </div>
);

export const SidebarTitle = props => (
    <div className="d:flex items:center justify:between h:24 p:8">
        <div className="text:2xl font:bold h:10">
            <strong>{props.title}</strong>
        </div>
        <div className="d:flex cursor:pointer text:2xl o:50 o:100:hover" onClick={props.onClose}>
            <CloseIcon />
        </div>
    </div>
);

SidebarTitle.defaultProps = {
    title: "",
    onClose: null,
};

export const SidebarSubmit = props => (
    <div className="p:8">
        <DefaultButton onClick={props.onSubmit} text={props.text} />
    </div>
);

SidebarSubmit.defaultProps = {
    text: "",
    onSubmit: null,
};
