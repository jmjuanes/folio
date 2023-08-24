import React from "react";
import {DrawingIcon} from "@josemi-icons/react";

export const Loading = () => (
    <div className="fixed w-full h-full top-0 left-0 z-10">
        <div className="flex items-center justify-center bg-white w-full h-full">
            <div className="animation-pulse">
                <div className="flex p-3 rounded-xl bg-gray-900 text-white text-6xl">
                    <DrawingIcon />
                </div>
            </div>
        </div>
    </div>
);
