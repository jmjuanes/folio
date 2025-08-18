import React from "react";
import { DrawingIcon } from "@josemi-icons/react";
import { useClient } from "../contexts/client.tsx";
import { BoardLink } from "./board-link.tsx";
import { GET_BOARDS_QUERY } from "../graphql.ts";

// export the boards list component
export const Boards = (): React.JSX.Element => {
    const [ boards, setBoards ] = React.useState(null);
    const client = useClient();

    // update boards when the component is rendered
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
        <div className="mx-auto w-full max-w-2xl px-6 py-12">
            <div className="font-bold text-3xl mb-6 text-gray-950 leading-none">
                <span>All Boards</span>
            </div>
            {(boards || []).length === 0 && (
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
            {(boards || []).length > 0 && (
                <div className="w-full grid grid-cols-3 gap-2">
                    {(boards || []).map(board => (
                        <BoardLink
                            key={`board:${board._id}`}
                            id={board._id}
                            name={board.name || "Untitled"}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
