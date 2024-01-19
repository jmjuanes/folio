import React from "react";
import {Dropdown, DropdownItem, DropdownSeparator} from "@josemi-ui/components";
import {DownloadIcon, ImageSlashIcon} from "@josemi-icons/react";
import {DotsVerticalIcon, TrashIcon, CopyIcon} from "@josemi-icons/react";

export const BoardItem = props => (
    <div className="w-full select-none relative">
        <div className="absolute top-0 right-0 mt-1 mr-1">
            <div className="flex relative group" tabIndex="0">
                <div className="flex bg-white hover:bg-neutral-200 group-focus-within:bg-neutral-900 rounded-full p-2 cursor-pointer">
                    <div className="flex group-focus-within:text-white">
                        <DotsVerticalIcon />
                    </div>
                </div>
                <Dropdown className="hidden group-focus-within:block top-full right-0 mt-1 z-5 w-40">
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
            <div className="w-full h-32 rounded-md bg-neutral-100 flex items-center justify-center">
                <div className="text-neutral-700 text-5xl flex">
                    <ImageSlashIcon />
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between flex-nowrap mt-2">
            <div className="cursor-pointer w-full" onClick={props.onClick}>
                <span className="font-bold">{props.title || "untitled"}</span>
            </div>
        </div>
        <div className="text-neutral-500 text-2xs flex items-center">
            <span>Updated on <b>{(new Date(props.updatedAt)).toLocaleDateString()}</b></span>
        </div>
    </div>
);
