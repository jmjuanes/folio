import React from "react";
import {renderIcon} from "@josemi-icons/react";
import {useDelayedEffect} from "../../hooks/index.js";
import {BoardEmpty} from "./board-empty.jsx";
import {BoardItem} from "./board-item.jsx";

export const BoardList = props => {
    const [boards, setBoards] = React.useState(null);
    const actions = [
        {
            text: "Create Board",
            icon: "file-plus",
            onClick: props.onCreate,
        },
        {
            text: "Import Board",
            icon: "upload",
            onClick: props.onLoad,
        },
    ];

    // We use a delayed effect just for displaying the loading ui
    useDelayedEffect(props.delay, [], () => {
        props.data().then(setBoards);
    });

    return (
        <div className="w-full">
            {props.title && (
                <div className="flex justify-between items-center mb-8 select-none">
                    <div className="text-4xl font-black leading-none">
                        <span>{props.title}</span>
                    </div>
                    {(boards && boards.length > 0) && (
                        <div className="flex items-center gap-2">
                            {actions.map(action => (
                                <div key={action.text} className="cursor-pointer" onClick={action.onClick}>
                                    <div className="rounded-md hover:bg-neutral-200 text-neutral-600 hover:text-neutral-800 flex items-center gap-1 p-2">
                                        <div className="text-lg flex">
                                            {renderIcon(action.icon)}
                                        </div>
                                        <div className="text-xs font-bold">
                                            <span>{action.text}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* No data to display... yet */}
            {!boards && (
                <div className="grid grid-cols-4 gap-8 select-none">
                    {[1,2,3,4].map(key => (
                        <div key={key} className="w-full animation-pulse">
                            <div className="w-full h-32 bg-neutral-200 rounded-lg" />
                            <div className="w-full h-8 bg-neutral-200 rounded-lg mt-4" />
                        </div>
                    ))}
                </div>
            )}
            {/* Render no boards data available */}
            {(boards && boards?.length === 0) && (
                <BoardEmpty
                    onCreate={props.onCreate}
                    onLoad={props.onLoad}
                />
            )}
            {/* Render boards items */}
            {(boards && boards.length > 0) && (
                <div className="grid grid-cols-4 gap-8">
                    {boards.map(board => (
                        <BoardItem
                            key={board.id}
                            id={board.id}
                            title={board.title}
                            updatedAt={board.updatedAt}
                            onClick={() => props.onBoardClick?.(board.id)}
                            onSave={() => props.onBoardSave?.(board.id)}
                            onDelete={() => props.onBoardDelete?.(board.id)}
                            onDuplicate={() => props.onBoardDuplicate?.(board.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

BoardList.defaultProps = {
    delay: 1000,
    data: null,
    title: "",
    onCreate: null,
    onLoad: null,
    onBoardClick: null,
    onBoardSave: null,
    onBoardDelete: null,
    onBoardDuplicate: null,
};
