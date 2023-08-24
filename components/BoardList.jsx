import React from "react";
import {DrawingIcon, FilePlusIcon} from "@josemi-icons/react";
import {ImageSlashIcon, EditIcon, DotsVerticalIcon, TrashIcon} from "@josemi-icons/react";
import {Dropdown, DropdownItem} from "./Dropdown.jsx";
import {useDelay} from "../hooks/index.js";

const BoardEmpty = props => (
    <div className="border-2 border-dashed border-gray-200 w-full rounded-xl">
        <div className="w-full py-16 flex flex-col items-center">
            <div className="flex text-7xl text-gray-900">
                <DrawingIcon />
            </div>
            <div className="font-black text-4xl text-gray-900 mt-2 font-crimson tracking-tight">
                <span>Let's start sketching.</span>
            </div>
            <div className="text-sm text-gray-600">
                Create your first board to start sketching.
            </div>
            <div className="mt-6">
                <div className="flex rounded-full border-2 border-gray-900 hover:bg-gray-900 hover:text-white cursor-pointer px-4 py-2" onClick={props.onCreate}>
                    <strong className="text-sm">Create a new board</strong>
                </div>
            </div>
        </div>
    </div>
);

const BoardCreateItem = props => (
    <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:bg-gray-100 rounded-xl" onClick={props.onClick}>
        <div className="flex text-6xl text-gray-400 mb-2">
            <FilePlusIcon />
        </div>
        <div className="text-center text-gray-400 text-xs">
            <strong>Create new</strong>
        </div>
    </div>
);

const BoardItem = props => (
    <div className="w-full">
        <div className="cursor-pointer" onClick={props.onClick}>
            <div className="rounded-lg bg-gray-100 text-gray-400 text-xl text-white flex justify-center">
                <div className="flex justify-center items-center h-32">
                    <ImageSlashIcon />
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between flex-nowrap mt-2">
            <div className="flex items-center gap-1 cursor-pointer" onClick={props.onClick}>
                <div className="flex font-bold">
                    <span>{props.title || "untitled"}</span>
                </div>
            </div>
            <div className="flex relative group" tabIndex="0">
                <div className="flex group-focus-within:bg-gray-200 rounded-md p-1 cursor-pointer">
                    <DotsVerticalIcon />
                </div>
                <Dropdown className="hidden group-focus-within:block absolute top-full right-0 mt-1 z-5">
                    <DropdownItem
                        icon={<TrashIcon />}
                        text="Delete..."
                        onClick={props.onDelete}
                    />
                </Dropdown>
            </div>
        </div>
        <div className="flex flex-nowrap gap-3">
            <div className="flex items-center gap-1 text-gray-500">
                <div className="text-xs flex items-center">
                    <EditIcon />
                </div>
                <div className="text-xs flex items-center">
                    <span>Updated on <b>{(new Date(props.updatedAt)).toLocaleDateString()}</b></span>
                </div>
            </div>
        </div>
    </div>
);

export const BoardList = props => {
    const [boards, setBoards] = React.useState(null);
    useDelay(props.delay, () => {
        return props.loadItems().then(items => {
            setBoards(items);
        });
    });
    return (
        <div className="w-full">
            {props.title && (
                <div className="mb-6">
                    <div className="font-crimson text-5xl font-black leading-none tracking-tight">
                        <span>{props.title}</span>
                    </div>
                    <div className="w-full h-px bg-gray-300 mt-2" />
                </div>
            )}
            {/* No data to display... yet */}
            {!boards && (
                <div className="grid grid-cols-4 gap-4">
                    {[1,2,3,4].map(key => (
                        <div key={key} className="w-full animation-pulse">
                            <div className="w-full h-24 bg-gray-300 rounded-lg" />
                            <div className="w-full h-8 bg-gray-300 rounded-lg mt-4" />
                        </div>
                    ))}
                </div>
            )}
            {/* Render no boards data available */}
            {(boards && boards?.length === 0) && (
                <BoardEmpty onCreate={props.onCreate} />
            )}
            {/* Render boards items */}
            {(boards && boards.length > 0) && (
                <div className="grid grid-cols-4 gap-4">
                    {props.showCreate && (
                        <BoardCreateItem onClick={props.onCreate} />
                    )}
                    {boards.map(board => (
                        <BoardItem
                            key={board.id}
                            id={board.id}
                            title={board.title}
                            updatedAt={board.updatedAt}
                            onClick={() => props.onBoardClick?.(board.id)}
                            onDelete={() => props.onBoardDelete?.(board.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

BoardList.defaultProps = {
    delay: 1000,
    title: "",
    loadItems: null,
    showCreate: true,
    onCreate: null,
    onBoardClick: null,
    onBoardDelete: null,
};
