import React from "react";
import {DrawingIcon} from "@josemi-icons/react";

export const Loading = () => (
    <div className="fixed w-full h-full top-0 left-0 z-10">
        <div className="flex items-center justify-center bg-white w-full h-full">
            <div className="text-4xl text-gray-700 animation-pulse">
                <DrawingIcon />
            </div>
        </div>
    </div>
);
