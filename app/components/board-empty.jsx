import React from "react";
import {Button} from "@josemi-ui/components";
import {DrawingIcon} from "@josemi-icons/react";

export const BoardEmpty = props => (
    <div className="select-none bg-neutral-100 w-full rounded-lg">
        <div className="w-full py-16 flex flex-col items-center">
            <div className="flex text-7xl text-neutral-950">
                <DrawingIcon />
            </div>
            <div className="font-black text-2xl text-neutral-900 mt-2">
                <span>No boards yet...</span>
            </div>
            <div className="text-sm text-neutral-600">
                Create your first board to start sketching.
            </div>
            <div className="mt-4">
                <Button variant="primary" onClick={props.onCreate}>
                    <strong>Create a new board</strong>
                </Button>
            </div>
            <div className="mt-1">
                <div className="text-center hover:underline cursor-pointer" onClick={props.onLoad}>
                    <span className="text-xs text-neutral-600">Or import from a local file...</span>
                </div>
            </div>
        </div>
    </div>
);
