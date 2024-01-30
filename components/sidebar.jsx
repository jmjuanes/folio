import React from "react";
import classNames from "classnames";
import {
    FileIcon,
    TrashIcon,
    LogoutIcon,
    PlusIcon,
    UploadIcon,
    DrawingIcon,
} from "@josemi-icons/react";

const ActionButton = props => (
    <div className="flex items-center gap-2 cursor-pointer rounded-md hover:bg-neutral-100 p-2 text-neutral-900" onClick={props.onClick}>
        <div className="flex text-lg">
            {props.icon}
        </div>
        <div className="text-sm">{props.text}</div>
    </div>
);

export const Sidebar = props => (
    <div className="w-72 h-full bg-white shrink-0 flex flex-col justify-between border-r border-neutral-200">
        <div className="flex flex-col gap-4 h-full scrollbar overflow-y-auto overflow-x-hidden">
            <div className="sticky top-0 font-black text-4xl leading-none select-none bg-white pt-6 px-6 pb-2">
                <span className="text-neutral-950">folio.</span>
            </div>
            <div className="flex flex-col gap-2 h-full px-6 select-none">
                <div className="flex flex-col mb-2">
                    <ActionButton
                        onClick={props.onBoardCreate}
                        icon={<PlusIcon />}
                        text="Create a new board"
                    />
                    <ActionButton
                        onClick={props.onBoardImport}
                        icon={<UploadIcon />}
                        text="Import board from file"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {(props.boards || []).map(item => (
                        <a
                            key={`board:item:${item.id}`}
                            href={`#${item.id}`}
                            className={classNames({
                                "group rounded-md w-full flex items-center": true,
                                "text-white bg-neutral-950": props.currentId === item.id,
                                "hover:bg-neutral-100 text-neutral-900": props.currentId !== item.id,
                            })}
                            title={item.title}
                        >
                            <div className="cursor-pointer flex items-center gap-2 p-2">
                                <div className="text-lg flex items-center">
                                    <FileIcon />
                                </div>
                                <div className="font-medium text-sm w-40 truncate">{item.title}</div>
                            </div>
                            <div
                                className="hidden group-hover:flex cursor-pointer items-center ml-auto text-lg p-2 o-60 hover:o-100"
                                onClick={event => {
                                    event.preventDefault();
                                    props?.onBoardDelete?.(item.id);
                                }}
                            >
                                <TrashIcon />
                            </div>
                        </a>
                    ))}
                    {props.boards && props.boards.length === 0 && (
                        <div className="border border-dashed border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center justify-center text-neutral-950 text-3xl mb-1">
                                <DrawingIcon />
                            </div>
                            <div className="text-center font-bold text-neutral-950 text-sm mb-1">No boards available</div> 
                            <div className="text-center text-xs text-neutral-700">Your created boards will be displayed here.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="hidden px-6 pt-4 pb-6 bg-white">
            <div className="cursor-pointer flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-md o-40 hover:o-100">
                <div className="text-lg flex items-center">
                    <LogoutIcon />
                </div>
                <div className="font-medium text-sm">Sign out</div>
            </div>
        </div>
    </div>
);
