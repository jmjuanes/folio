import React from "react";
import {DotsIcon} from "@josemi-icons/react";

export const Loading = () => (
    <div className="fixed w-full h-full top-0 left-0 z-10">
        <div className="flex flex-col items-center justify-center bg-white w-full h-full">
            <div className="font-black text-4xl text-neutral-800 tracking-tight leading-none">
                <span>folio.</span>
            </div>
            <div className="flex animation-pulse text-neutral-300 text-4xl">
                <DotsIcon />
            </div>
        </div>
    </div>
);
