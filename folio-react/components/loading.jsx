import React from "react";
import { Centered } from "./ui/centered.jsx";

export const LoadingSpinner = () => (
    <div className="animate-spin h-6 w-6 relative">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-current border-4 border-solid opacity-20" />
        <div
            className="absolute top-0 left-0 w-full h-full rounded-full border-transparent border-4 border-solid opacity-90"
            style={{
                borderLeftColor: "currentColor",
            }}
        />
    </div>
);

export const Loading = props => (
    <Centered className={props.className} style={props.style}>
        <div className="flex items-center">
            <LoadingSpinner />
        </div>
    </Centered>
);
