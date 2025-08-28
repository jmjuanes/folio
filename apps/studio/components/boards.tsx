import React from "react";
import { DrawingIcon } from "@josemi-icons/react";
import { useEventListener } from "../hooks/use-events.ts";
import { useActions } from "../hooks/use-actions.ts";
import { BoardCard } from "./board-card.tsx";
import { EVENT_NAMES, ACTIONS } from "../constants.ts";

// export the boards list component
export const Boards = (): React.JSX.Element => {
    const [ boards, setBoards ] = React.useState(null);
    const boardActionEventData = useEventListener(EVENT_NAMES.BOARD_ACTION, {});
    const dispatchAction = useActions();

    // update boards when the component is rendered
    React.useEffect(() => {
        setBoards(null);
        dispatchAction(ACTIONS.GET_RECENT_BOARDS, {})
            .then(boards => {
                setBoards(boards);
            })
            .catch(error => {
                console.error("Error fetching boards:", error);
            });
    }, [ setBoards, boardActionEventData ]);

    return (
        <div className="mx-auto w-full max-w-2xl px-6 py-12">
            <div className="font-bold text-3xl mb-6 text-gray-950 leading-none">
                <span>All Boards</span>
            </div>
            {boards && boards?.length === 0 && (
                <div className="bg-gray-50 rounded-lg py-12 px-6">
                    <div className="flex items-center justify-center text-gray-800 text-4xl mb-1">
                        <DrawingIcon />
                    </div>
                    <div className="text-center font-bold text-gray-800">
                        <span>No boards available</span>
                    </div> 
                    <div className="text-center text-xs text-gray-500">
                        <span>Your created boards will be displayed here.</span>
                    </div>
                </div>
            )}
            {boards && boards?.length > 0 && (
                <div className="w-full grid grid-cols-3 gap-4">
                    {(boards || []).map(board => (
                        <BoardCard
                            key={`board:${board.id}`}
                            id={board.id}
                            name={board.attributes?.name || "Untitled"}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
