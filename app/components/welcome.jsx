import React from "react";
import { FolderIcon, DrawingIcon, ClockIcon } from "@josemi-icons/react";
import { Centered } from "folio-react/components/ui/centered.jsx";
import { Button } from "folio-react/components/ui/button.jsx";
import { BoardLink } from "./board-link.jsx";
import { getGreetingMessage } from "../utils/dates.js";

// @description render recent boards
const RecentBoards = props => (
    <div className="mt-2 select-none">
        <div className="flex items-center gap-1 mb-3 text-gray-600">
            <div className="text-base flex">
                <ClockIcon />
            </div>
            <div className="text-xs font-bold">Your recent boards</div>
        </div>
        <div className="w-full grid grid-cols-3 gap-2">
            {props.boards.slice(0, props.maxRecentBoards).map(item => (
                <BoardLink
                    key={item.id}
                    board={item}
                />
            ))}
        </div>
    </div>
);

// @description welcome component
export const Welcome = props => (
    <Centered className="min-h-full bg-white">
        <div className="w-full max-w-2xl px-6 py-20 bg-white border-none border-gray-200 rounded-lg shadow-none">
            <div className="pt-4 pb-12 select-none">
                <div className="font-bold font-serif tracking-tight text-4xl mb-4 text-gray-950 leading-none text-center">
                    <span>{getGreetingMessage()}</span>
                </div>
                <div className="hidden text-gray-700 text-lg mb-2 text-center">
                    <span>Welcome to </span>
                    <span className="font-bold">folio</span>
                    <span>, your personal board manager.</span>
                </div>
                <div className="text-gray-700 text-center mb-6">
                    <span>Here you can create boards to organize your ideas, tasks, and projects. </span>
                    <span>Use the sidebar to navigate through your boards, or create a new one to get started.</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="w-full" onClick={() => props.onBoardCreate()}>
                        <div className="flex items-center text-lg">
                            <DrawingIcon />
                        </div>
                        <div className="font-medium">Create new</div>
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => props.onBoardImport()}>
                        <div className="flex items-center text-lg">
                            <FolderIcon />
                        </div>
                        <div className="font-medium">Import from file</div>
                    </Button>
                </div>
            </div>
            {props.boards.length > 0 && (
                <RecentBoards
                    boards={props.boards}
                    maxRecentBoards={6}
                />
            )}
        </div>
    </Centered>
);
