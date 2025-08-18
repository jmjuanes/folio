import React from "react";
import { FolderIcon, DrawingIcon, ClockIcon } from "@josemi-icons/react";
import { Centered } from "folio-react/components/ui/centered.jsx";
import { Button } from "folio-react/components/ui/button.jsx";
import { useActions } from "../hooks/use-actions.ts";
import { useClient } from "../contexts/client.tsx";
import { BoardLink } from "./board-link.tsx";
import { getGreetingMessage } from "../utils/dates.ts";
import { ACTIONS } from "../constants.ts";
import { GET_BOARDS_QUERY } from "../graphql.ts";

// @description render recent boards
const RecentBoards = ({ boards, maxRecentBoards }): React.JSX.Element => (
    <div className="mt-2 select-none">
        <div className="flex items-center gap-1 mb-3 text-gray-600">
            <div className="text-base flex">
                <ClockIcon />
            </div>
            <div className="text-xs font-bold">Your recent boards</div>
        </div>
        <div className="w-full grid grid-cols-3 gap-2">
            {(boards || []).slice(0, maxRecentBoards || 6).map(board => (
                <BoardLink
                    key={board._id}
                    id={board._id}
                    board={board.name}
                />
            ))}
        </div>
    </div>
);

// @description home view component
export const Home = (): React.JSX.Element => {
    const client = useClient();
    const dispatchAction = useActions();
    const [ boards, setBoards ] = React.useState<any[]>(null);

    // handle board creation
    const handleBoardCreate = React.useCallback(() => {
        dispatchAction(ACTIONS.CREATE_BOARD, {});
    }, [ dispatchAction ]);

    // handle board import
    const handleBoardImport = React.useCallback(() => {
        dispatchAction(ACTIONS.IMPORT_BOARD, {});
    }, [ dispatchAction ]);

    // update boards when the event is triggered
    React.useEffect(() => {
        client.graphql(GET_BOARDS_QUERY, {})
            .then(response => {
                setBoards(response.data.boards);
            })
            .catch(error => {
                console.error("Error fetching boards:", error);
            });
    }, [ setBoards, client ]);

    return (
        <Centered className="min-h-full bg-white">
            <div className="w-full max-w-2xl px-6 py-20 bg-white border-none border-gray-200 rounded-lg shadow-none">
                <div className="pt-4 pb-12 select-none">
                    <div className="font-bold text-4xl mb-4 text-gray-950 leading-none text-center">
                        <span>{getGreetingMessage()}</span>
                    </div>
                    <div className="text-gray-700 text-center mb-6">
                        <span>Here you can create boards to organize your ideas, tasks, and projects. </span>
                        <span>Use the sidebar to navigate through your boards, or create a new one to get started.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button className="w-full" onClick={() => handleBoardCreate()}>
                            <div className="flex items-center text-lg">
                                <DrawingIcon />
                            </div>
                            <div className="font-medium">Create new</div>
                        </Button>
                        <Button variant="secondary" className="w-full" onClick={() => handleBoardImport()}>
                            <div className="flex items-center text-lg">
                                <FolderIcon />
                            </div>
                            <div className="font-medium">Import from file</div>
                        </Button>
                    </div>
                </div>
                {boards && boards?.length > 0 && (
                    <RecentBoards
                        boards={boards}
                        maxRecentBoards={6}
                    />
                )}
            </div>
        </Centered>
    );
};
