import React from "react";
import {LoaderIcon} from "@josemi-icons/react";

export const Loading = () => (
    <div className="fixed w-full h-full top-0 left-0 z-10">
        <div className="flex flex-col items-center justify-center bg-white w-full h-full">
            <div className="font-black text-6xl text-gray-900 font-crimson tracking-tight leading-none">
                <span>Folio.</span>
            </div>
            <div className="hidden mt-2">
                <div className="flex animation-spin text-gray-500">
                    <LoaderIcon />
                </div>
            </div>
        </div>
    </div>
);
