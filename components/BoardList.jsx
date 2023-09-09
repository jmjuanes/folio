import React from "react";
import {DownloadIcon, DrawingIcon, ImageSlashIcon, renderIcon} from "@josemi-icons/react";
import {EditIcon, DotsVerticalIcon, TrashIcon, CopyIcon} from "@josemi-icons/react";
import {Dropdown, DropdownItem, DropdownSeparator} from "./Dropdown.jsx";
import {useDelay} from "../hooks/index.js";

const BoardEmpty = props => (
    <div className="select-none border-2 border-dashed border-gray-200 w-full rounded-xl">
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
            <div className="mt-1">
                <div className="text-center hover:underline cursor-pointer" onClick={props.onLoad}>
                    <span className="text-xs text-gray-600">Or import from a local file...</span>
                </div>
            </div>
        </div>
    </div>
);

const BoardItem = props => (
    <div className="w-full select-none relative">
        <div className="absolute top-0 right-0 mt-1 mr-1">
            <div className="flex relative group" tabIndex="0">
                <div className="flex bg-white hover:bg-gray-200 group-focus-within:bg-gray-900 rounded-full p-2 cursor-pointer">
                    <div className="flex group-focus-within:text-white">
                        <DotsVerticalIcon />
                    </div>
                </div>
                <Dropdown className="hidden group-focus-within:block absolute top-full right-0 mt-1 z-5">
                    <DropdownItem
                        icon={<DownloadIcon />}
                        text="Save as..."
                        onClick={props.onSave}
                    />
                    <DropdownItem
                        icon={(<CopyIcon />)}
                        text="Make a copy"
                        onClick={props.onDuplicate}
                    />
                    <DropdownSeparator />
                    <DropdownItem
                        icon={<TrashIcon />}
                        text="Delete..."
                        onClick={props.onDelete}
                    />
                </Dropdown>
            </div>
        </div>
        <div className="w-full cursor-pointer" onClick={props.onClick}>
            <div className="w-full h-32 rounded-lg border-2 border-gray-900 flex items-center justify-center">
                <div className="text-gray-700 text-5xl flex">
                    <ImageSlashIcon />
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between flex-nowrap mt-2">
            <div className="cursor-pointer text-center w-full" onClick={props.onClick}>
                <span className="font-bold">{props.title || "untitled"}</span>
            </div>
        </div>
        <div className="flex flex-nowrap gap-3 justify-center">
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

const BoardActionButton = props => (
    <div className="cursor-pointer" onClick={props.onClick}>
        <div className="rounded-md hover:bg-gray-200 text-gray-600 flex items-center gap-1 p-2">
            <div className="text-lg flex">
                {renderIcon(props.icon)}
            </div>
            <div className="text-xs font-bold">
                <span>{props.text}</span>
            </div>
        </div>
    </div>
);

export const BoardList = props => {
    const [boards, setBoards] = React.useState(null);
    useDelay(props.delay, () => {
        return props.data().then(items => {
            setBoards(items);
        });
    });
    return (
        <div className="w-full">
            {props.title && (
                <div className="flex justify-between items-center mb-8 select-none">
                    <div className="font-crimson text-5xl font-black leading-none tracking-tight">
                        <span>{props.title}</span>
                    </div>
                    {(boards && boards.length > 0) && (
                        <div className="flex items-center gap-2">
                            {props.showCreate && (
                                <BoardActionButton
                                    text="Create Board"
                                    icon="file-plus"
                                    onClick={props.onCreate}
                                />
                            )}
                            {props.showLoad && (
                                <BoardActionButton
                                    text="Import Board"
                                    icon="upload"
                                    onClick={props.onLoad}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
            {/* No data to display... yet */}
            {!boards && (
                <div className="grid grid-cols-4 gap-8 select-none">
                    {[1,2,3,4].map(key => (
                        <div key={key} className="w-full animation-pulse">
                            <div className="w-full h-32 bg-gray-300 rounded-lg" />
                            <div className="w-full h-8 bg-gray-300 rounded-lg mt-4" />
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
                            coverColor={board.coverColor}
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
    showCreate: true,
    showLoad: true,
    onCreate: null,
    onLoad: null,
    onBoardClick: null,
    onBoardSave: null,
    onBoardDelete: null,
    onBoardDuplicate: null,
};
