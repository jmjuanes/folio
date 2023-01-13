import React from "react";
import {CloseIcon} from "../icons/index.jsx";

export const Toaster = props => {
    const parentStyle = {
        transform: "translateX(-50%)",
        maxWidth: props.maxWidth,
    };

    return (
        <div className="position:fixed bottom:0 left:half z:10 w:full" style={parentStyle}>
            {props.toasts.map(item => (
                <div key={item.id} className="w:full mb:2">
                    <div className="w:full p:4 bg:dark-600 text:white r:lg d:flex items:center">
                        <div className="w:full">
                            <strong>{item.message}</strong>
                        </div>
                        <div className="cursor:pointer" onClick={() => props.onRemove(item.id)}>
                            <div className="bg:dark-100 bg:dark-200:hover r:md d:flex items:center justify:center h:10 w:10 text:xl">
                                <CloseIcon />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

Toaster.defaultProps = {
    toasts: [],
    maxWidth: "600px",
    onRemove: null,
};
