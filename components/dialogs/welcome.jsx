import React from "react";
import {DrawingIcon, FolderIcon, FileIcon} from "@josemi-icons/react";
import {Button, Centered, Overlay} from "@josemi-ui/react";

export const WelcomeDialog = props => (
    <React.Fragment>
        <Overlay className="z-9" />
        <Centered className="fixed h-full z-10">
            <div className="w-full max-w-lg p-8 bg-white border border-neutral-200 rounded-lg shadow-sm">
                <div className="pt-12 pb-8 select-none">
                    <div className="font-black text-5xl mb-6 text-neutral-950 leading-none">Hello 👋</div>
                    <div className="">
                        Welcome to <b>folio</b>, our work-in-progress minimal digital whiteboard for sketching and prototyping.
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="w-full" onClick={props.onCreate}>
                        <div className="flex items-center text-lg">
                            <DrawingIcon />
                        </div>
                        <div className="font-bold">Start drawing</div>
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={props.onLoad}>
                        <div className="flex items-center text-lg">
                            <FolderIcon />
                        </div>
                        <div className="font-medium">Load from file</div>
                    </Button>
                </div>
                <div className="mt-8 text-neutral-400 text-center text-xs select-none">
                    <span><b>folio</b> v{process.env.VERSION}</span> 
                </div>
            </div>
        </Centered>
    </React.Fragment>
);
