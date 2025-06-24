import React from "react";
import {FileIcon, ClockIcon} from "@josemi-icons/react";
import {Centered} from "folio-react/components/ui/centered.jsx";
import {useApp} from "../contexts/app.jsx";

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
    <a href={`#${props.id}`} className="relative text-gray-900 bg-white rounded-xl border-1 border-gray-200 hover:shadow-sm cursor-pointer overflow-hidden">
        <div className="text-4xl text-gray-500 flex items-center absolute top-0 left-0 mt-10 ml-3">
            <FileIcon />
        </div>
        <div className="bg-gray-200 h-16" />
        <div className="px-4 py-6">
            <div className="text-base truncate font-medium">{props.name || "Untitled"}</div>
        </div>
    </a>
);

// @description render recent boards
const RecentBoards = props => {
    const app = useApp();

    // empty boards list, do not render
    if (app.boards.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 select-none">
            <div className="flex items-center gap-1 mb-4 text-gray-600">
                <div className="text-base flex">
                    <ClockIcon />
                </div>
                <div className="text-xs font-bold">Recent boards</div>
            </div>
            <div className="w-full grid grid-cols-3 gap-4">
                {app.boards.slice(0, props.maxRecentBoards).map(item => (
                    <BoardItem
                        key={item.id}
                        id={item.id}
                        name={item.name}
                    />
                ))}
            </div>
        </div>
    );
};

// @description welcome component
export const Welcome = () => {
    return (
        <Centered className="min-h-full bg-white">
            <div className="w-full max-w-3xl px-6 py-20 bg-white border-none border-gray-200 rounded-lg shadow-none">
                <div className="pt-4 pb-2 select-none">
                    <div className="font-bold font-serif tracking-tight text-4xl mb-6 text-gray-950 leading-none">
                        <span>{getGreetingMessage()}</span>
                    </div>
                </div>
                <RecentBoards maxRecentBoards={6} />
            </div>
        </Centered>
    );
};
