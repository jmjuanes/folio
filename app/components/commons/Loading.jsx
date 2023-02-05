import React from "react";
import {DrawingIcon} from "@mochicons/react";
// import {Logo} from "./Logo.jsx";

export const Loading = () => (
    <div className="position:fixed w:full h:full top:0 left:0 bg:white d:flex items:center justify:center">
        <div className="text:4xl text:dark-700 animation:pulse">
            <DrawingIcon />
        </div>
    </div>
);
