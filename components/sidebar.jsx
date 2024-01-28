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
import {Dropdown} from "@josemi-ui/react";
import {useClient} from "@components/contexts/client.jsx";

export const Sidebar = React.forwardRef((props, ref) => {
    const client = useClient();
    const [boards, setBoards] = React.useState(null);

    // Internal update method
    const update = React.useCallback(() => {
        client.list()
            .then(data => data.sort((a, b) => a.title < b.title ? -1 : 1))
            .then(data => {
                setBoards(data || []);
            });
    });

    if (ref && typeof ref?.current !== "undefined") {
        ref.current = {
            update: update,
        };
    }

    // When this component is mounted or the current id changes, import boards data
    React.useEffect(() => update(), [props.currentId]);

    return (
        <div className="w-64 h-full bg-white shrink-0 flex flex-col justify-between border-r border-neutral-200">
            <div className="flex flex-col gap-4 h-full scrollbar overflow-y-auto overflow-x-hidden">
                <div className="sticky top-0 font-black text-4xl leading-none select-none bg-white pt-6 px-6 pb-2">
                    <span className="text-neutral-950">folio.</span>
                </div>
                <div className="flex flex-col gap-2 h-full px-6">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-lg text-neutral-950">Your boards</div>
                        <div className="flex items-center gap-1">
                            <div className="flex relative group" tabIndex="0">
                                <div className="flex items-center p-2 rounded-md group-focus-within:bg-neutral-100">
                                    <div className="flex text-lg">
                                        <PlusIcon />
                                    </div>
                                </div>
                                <Dropdown className="hidden group-focus-within:block top-full right-0 mt-1 w-40 z-5">
                                    <Dropdown.Item onClick={props.onBoardCreate}>
                                        <Dropdown.Icon>
                                            <PlusIcon />
                                        </Dropdown.Icon>
                                        <span>Create New</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={props.onBoardImport}>
                                        <Dropdown.Icon>
                                            <UploadIcon />
                                        </Dropdown.Icon>
                                        <span>Import</span>
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    <div className="select-none flex flex-col gap-1">
                        {(boards || []).map(item => (
                            <a
                                key={`board:item:${item.id}`}
                                href={`#${item.id}`}
                                className={classNames({
                                    "group rounded-md w-full flex items-center": true,
                                    "text-white bg-neutral-950": props.currentId === item.id,
                                    "hover:bg-neutral-100 text-neutral-900": props.currentId !== item.id,
                                })}
                            >
                                <div className="cursor-pointer flex items-center gap-2 p-2">
                                    <div className="text-lg flex items-center">
                                        <FileIcon />
                                    </div>
                                    <div className="font-medium text-sm w-32 truncate">{item.title}</div>
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
                        {boards && boards.length === 0 && (
                            <div className="border border-dashed border-neutral-200 rounded-lg p-4">
                                <div className="flex items-center justify-center text-neutral-950 text-3xl mb-1">
                                    <DrawingIcon />
                                </div>
                                <div className="text-center font-bold text-neutral-950 text-sm mb-1">No boards available</div> 
                                <div className="text-center text-xs text-neutral-700">Your crated boards will be displayed here.</div>
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
});
