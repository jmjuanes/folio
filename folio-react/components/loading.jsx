import React from "react";
import {DrawingIcon} from "@josemi-icons/react";
import {Centered} from "./ui/centered.jsx";

export const Loading = () => (
    <Centered>
        <div className="flex items-center text-4xl text-gray-900">
            <DrawingIcon />
        </div>
    </Centered>
);
