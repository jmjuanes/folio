import React from "react";
import classNames from "classnames";
import {DrawingIcon} from "@mochicons/react";

export const Loading = () => {
    const classList = classNames({
        "d:flex flex:col items:center justify:center": true,
        "position:absolute top:0 left:0 w:full h:full": true,
        // "bg:white text:dark-700": !props.overlay,
        "text:white": true, // props.overlay,
    });

    return (
        <div className="position:fixed w:full h:full top:0 left:0 z:10">
            <div className="position:absolute w:full h:full bg:dark-700 o:50 top:0 left:0" />
            <div className={classList}>
                <div className="text:4xl animation:pulse">
                    <DrawingIcon />
                </div>
            </div>
        </div>
    );
};
