import React from "react";
import {CloseIcon} from "../icons/index.jsx";

export const Modal = props => (
    <React.Fragment>
        <div className="position:fixed w:full h:full bg:dark-700 o:50 z:9 top:0 left:0" />
        <div className="position:fixed w:full h:full d:flex items:center justify:center z:10 top:0 left:0">
            <div className="r:xl bg:light-100 w:full p:10" style={{maxWidth: props.maxWidth}}>
                <div className="d:flex items:center justify:between h:24 pb:8">
                    <div className="text:2xl font:bold h:10">
                        <strong>{props.title}</strong>
                    </div>
                    <div
                        className="d:flex cursor:pointer text:2xl r:full bg:light-300 p:2 text:dark-100"
                        onClick={props.onClose}
                    >
                        <CloseIcon />
                    </div>
                </div>
                {props.children}
            </div>          
        </div>
    </React.Fragment>
);

Modal.defaultProps = {
    maxWidth: "500px",
    title: "",
    onClose: null,
};
