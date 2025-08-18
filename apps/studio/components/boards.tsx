import React from "react";
import classNames from "classnames";
import { renderIcon, DrawingIcon } from "@josemi-icons/react";
import { useClient } from "../contexts/client.tsx";
import { useRouter } from "../contexts/router.tsx";
import { BoardLink } from "./board-link.tsx";

const BoardsGroup = ({ title, boards, onRename, onDelete }): React.JSX.Element => {
    const [hash] = useRouter();
    return (
        <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-600 mb-0 px-2 flex overflow-hidden">
                <div className="shrink-0">{title || ""}</div>
            </div>
            {(boards || []).map(item => (
                <BoardLink
                    key={`board:item:${item.id}`}
                    board={item}
                    active={hash === item.id}
                    onRename={() => onRename(item)}
                    onDelete={() => onDelete(item)}
                />
            ))}
        </div>
    );
};

// @description render boards list
const BoardsList = ({ boards, onRename, onDelete }): React.JSX.Element => {
    const groups = React.useMemo(() => {
        return groupByDate(boards, "updated_at");
    }, [boards, boards.length]);

    return (
        <React.Fragment>
            {groups.today.length > 0 && (
                <BoardsGroup
                    title="Today"
                    boards={groups.today}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.yesterday.length > 0 && (
                <BoardsGroup
                    title="Yesterday"
                    boards={groups.yesterday}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.thisWeek.length > 0 && (
                <BoardsGroup
                    title="This Week"
                    boards={groups.thisWeek}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.thisMonth.length > 0 && (
                <BoardsGroup
                    title="This Month"
                    boards={groups.thisMonth}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
            {groups.others.length > 0 && (
                <BoardsGroup
                    title="Older Boards"
                    boards={groups.others}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            )}
        </React.Fragment>
    );
};

// export the boards list component
export const Boards = (): React.JSX.Element => {
    const [ boards, setBoards ] = React.useState(null);
    const client = useClient();

    // update boards when the component is rendered
    React.useEffect(() => {
        // client.graphql(GET_BOARDS_QUERY, {})
        //     .then(response => {
        //         setBoards(response.data.boards);
        //     })
        //     .catch(error => {
        //         console.error("Error fetching boards:", error);
        //     });
    }, [ setBoards, client ]);

    return (
        <div className="mx-auto w-full max-w-2xl px-6 py-12">
            <div className="pt-4 pb-12 select-none">
                <div className="font-bold text-4xl mb-4 text-gray-950 leading-none">
                    <span>Your Boards</span>
                </div>
            </div>
            {(boards || []).length === 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border-0 border-gray-200">
                    <div className="flex items-center justify-center text-gray-700 text-3xl mb-1">
                        <DrawingIcon />
                    </div>
                    <div className="text-center font-bold text-gray-700 text-sm mb-1">
                        <span>No boards available</span>
                        </div> 
                    <div className="text-center text-xs text-gray-500">
                        <span>Your created boards will be displayed here.</span>
                    </div>
                </div>
            )}
        </div>
    );
};
