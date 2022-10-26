import React from "react";

export const Modal = props => (
    <div className="d-flex items-center justify-center">
        <div className="radous-md p-2 bg-white" style={{maxWidth:props.width}}>
            {props.onClose && (
                <div align="center" style={{marginBottom:"1rem"}}>
                    <span onClick={props.onClose}>x</span>
                </div>
            )}
            {props.title && (
                <div align="center" style={{marginBottom:"2rem"}}>
                    <h1>{props.title}</h1>
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
