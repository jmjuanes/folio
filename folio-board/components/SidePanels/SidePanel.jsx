import React from "react"
import {CloseIcon} from "../icons/index.jsx";
import {DefaultButton} from "../Buttons/index.jsx";

export const SidePanel = props => (
    <div className="d:flex flex:col w:96 h:full bg:light-300">
        <div className="d:flex items:center justify:between h:24 p:8">
            <div className="text:2xl font:bold h:10">
                <strong>{props.title}</strong>
            </div>
            <div className="d:flex cursor:pointer text:2xl o:50 o:100:hover" onClick={props.onClose}>
                <CloseIcon />
            </div>
        </div>
        <div className="h:full p:8 overflow-y:auto">
            {props.children}
        </div>
        {!!props.submitText && !!props.onSubmit && (
            <div className="p:8">
                <DefaultButton onClick={props.onSubmit} text={props.submitText} />
            </div>
        )}
    </div>
);

SidePanel.defaultProps = {
    title: "",
    submitText: null,
    onClose: null,
    onSubmit: null,
};
