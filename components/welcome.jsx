import React from "react";
import {DrawingIcon, FolderIcon, FileIcon} from "@josemi-icons/react";
import {Button, Centered} from "@josemi-ui/react";

const getRecentBoards = (boards, maxRecentBoards = 6) => {
    return boards
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, maxRecentBoards);
};

export const Welcome = props => (
    <Centered className="min-h-full bg-white">
        <div className="w-full max-w-md p-8 bg-white border-none border-neutral-200 rounded-lg shadow-none">
            <div className="pt-4 pb-6 select-none">
                <div className="font-black text-4xl mb-6 text-neutral-950 leading-none">Hello 👋</div>
                <div className="">
                    Welcome to <b>folio</b>, our work-in-progress minimal digital whiteboard for sketching and prototyping.
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button className="w-full" onClick={props.onBoardCreate}>
                    <div className="flex items-center text-lg">
                        <DrawingIcon />
                    </div>
                    <div className="font-medium">New drawing</div>
                </Button>
                <Button variant="secondary" className="w-full" onClick={props.onBoardImport}>
                    <div className="flex items-center text-lg">
                        <FolderIcon />
                    </div>
                    <div className="font-medium">Import from file</div>
                </Button>
            </div>
            {props.boards && props.boards.length > 0 && (
                <div className="mt-8 select-none">
                    <div className="text-center text-neutral-600 text-sm mb-2">
                        <span>Or open a recent board:</span>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-2">
                        {getRecentBoards(props.boards).map(item => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-100 p-2 rounded-md border border-neutral-200"
                                title={item.title}
                            >
                                <div className="text-lg flex items-center">
                                    <FileIcon />
                                </div>
                                <div className="text-sm truncate">{item.title}</div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
            <div className="mt-8 text-neutral-400 text-center text-xs select-none">
                <span><b>folio</b> v{process.env.VERSION}</span> 
            </div>
        </div>
    </Centered>
);