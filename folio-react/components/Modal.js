import React from "react";
import {
    modalClass,
    scrimClass,
    closeClass,
    titleClass,
} from "../styles.js";

export const Modal = props => (
    <div className={scrimClass}>
        <div className={modalClass} style={{maxWidth:props.width}}>
            {props.onClose && (
                <div align="center" style={{marginBottom:"1rem"}}>
                    <div className={closeClass} onClick={props.onClose} />
                </div>
            )}
            {props.title && (
                <div align="center" style={{marginBottom:"2rem"}}>
                    <div className={titleClass} style={{fontSize:"2.5rem"}}>
                        <b>{props.title}</b>
                    </div>
                </div>
            )}
            {props.children}
        </div>
    </div>
);

Modal.defaultProps = {
    width: "400px",
    title: null,
    onClose: null,
};
