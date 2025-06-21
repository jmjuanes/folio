import React from "react";
import {DrawingIcon, FolderIcon, FileIcon, ClockIcon} from "@josemi-icons/react";
import {Button} from "folio-react/components/ui/button.jsx";
import {Centered} from "folio-react/components/ui/centered.jsx";

const getRecentBoards = (boards, maxRecentBoards = 6) => {
    return boards
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, maxRecentBoards);
};

// @description method to get the message to greet the user
const getGreetingMessage = () => {
    const hours = (new Date()).getHours();
    if (hours < 12) {
        return "Good morning";
    }
    else if (hours < 20) {
        return "Good afternoon";
    }
    else {
        return "Good evening";
    }
};

// @description board item component
const BoardItem = props => (
    <a href={`#b/${props.id}`} className="relative text-gray-900 bg-white rounded-xl border-1 border-gray-200 hover:shadow-sm cursor-pointer overflow-hidden">
        <div className="text-4xl text-gray-500 flex items-center absolute top-0 left-0 mt-10 ml-3">
            <FileIcon />
        </div>
        <div className="bg-gray-200 h-16" />
        <div className="px-4 py-6">
            <div className="text-base truncate font-medium">{props.name || "Untitled"}</div>
        </div>
    </a>
);

// @description welcome component
export const Welcome = props => (
    <Centered className="min-h-full bg-white">
        <div className="w-full max-w-3xl px-6 py-20 bg-white border-none border-gray-200 rounded-lg shadow-none">
            <div className="pt-4 pb-2 select-none">
                <div className="font-bold font-serif tracking-tight text-4xl mb-6 text-gray-950 leading-none">
                    <span>{getGreetingMessage()}, Josemi</span>
                </div>
            </div>
            <div className="hidden items-center gap-2">
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
                <div className="mt-2 select-none">
                    <div className="flex items-center gap-1 mb-4 text-gray-600">
                        <div className="text-base flex">
                            <ClockIcon />
                        </div>
                        <div className="text-xs font-bold">Recent boards</div>
                    </div>
                    <div className="w-full grid grid-cols-4 gap-4">
                        {getRecentBoards(props.boards).map(item => (
                            <BoardItem key={item.id} id={item.id} name={item.name} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    </Centered>
);