import React from "react";
import {DrawingIcon} from "@mochicons/react";

export const Loading = () => (
    <div className="position:fixed w:full h:full top:0 left:0 z:10">
        <div className="d:flex items:center justify:center bg:white w:full h:full">
            <div className="text:4xl text:dark-700 animation:pulse">
                <DrawingIcon />
            </div>
        </div>
    </div>
);
