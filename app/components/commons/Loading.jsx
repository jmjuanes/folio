import React from "react";
import {Logo} from "./Logo.jsx";

export const Loading = props => (
    <div className="position:fixed w:full h:full top:0 left:0 bg:white d:flex items:center justify:center">
        <div className="">
            <Logo size="md" animated={true} />
        </div>
    </div>
);
