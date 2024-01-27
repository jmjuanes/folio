import React from "react";
import {useMount} from "react-use";
import classNames from "classnames";
import {FileIcon, TrashIcon, LogoutIcon, PlusIcon, UploadIcon} from "@josemi-icons/react";

export default props => {
    const [boards, setBoards] = React.useState(null);
    const handleBoardDelete = React.useCallback((event, boardId) => {
        event.preventDefault();
        props.onBoardDelete(boardId);
    }, []);

    // List of actions to perform to boards
    const boardActions = [
        {
            id: "create",
            onClick: props.onBoardCreate,
            icon: <PlusIcon />,
        },
        {
            id: "import",
            onClick: props.onBoardImport,
            icon: <UploadIcon />,
        },
    ];

    useMount(() => {
        return props.loadBoards().then(data => {
            setBoards(data || []);
        });
    });

    return (
        <div className="w-72 h-full bg-white shrink-0 flex flex-col justify-between border-r border-neutral-200">
            <div className="flex flex-col gap-4 h-full scrollbar overflow-y-auto overflow-x-hidden">
                <div className="sticky top-0 font-black text-4xl leading-none select-none bg-white pt-6 px-6 pb-2">
                    <span>folio.</span>
                </div>
                <div className="flex flex-col gap-2 h-full px-6">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-lg text-neutral-950">Your boards</div>
                        <div className="flex items-center gap-1">
                            {boardActions.map(action => (
                                <div
                                    key={action.id}
                                    className="flex text-lg text-neutral-900 hover:bg-neutral-100 rounded-md p-2 cursor-pointer"
                                    tabIndex="0"
                                    onClick={action.onClick}
                                >
                                    {action.icon}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="">
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
                                    <div className="font-medium text-sm w-40 truncate">{item.title}</div>
                                </div>
                                <div
                                    className="hidden group-hover:flex cursor-pointer items-center ml-auto text-lg p-2 o-60 hover:o-100"
                                    onClick={event => handleBoardDelete(event, item.id)}
                                >
                                    <TrashIcon />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-6 pt-4 pb-6 bg-white">
                <div className="cursor-pointer flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-md o-40 hover:o-100">
                    <div className="text-lg flex items-center">
                        <LogoutIcon />
                    </div>
                    <div className="font-medium text-sm">Sign out</div>
                </div>
            </div>
        </div>
    );
};
