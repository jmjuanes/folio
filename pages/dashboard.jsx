import React from "react";
import {Button} from "@josemi-ui/components";
import {Alert, AlertIcon, AlertTitle, AlertDescription} from "@josemi-ui/components";
import {Dropdown, DropdownItem, DropdownSeparator} from "@josemi-ui/components";
import {ExclamationTriangleIcon} from "@josemi-icons/react";
import {DownloadIcon, DrawingIcon, ImageSlashIcon, renderIcon} from "@josemi-icons/react";
import {DotsVerticalIcon, TrashIcon, CopyIcon} from "@josemi-icons/react";
import {loadFromJson, saveAsJson} from "../board/json.js";
import {useClient} from "../contexts/ClientContext.jsx";
import {useConfirm} from "../contexts/ConfirmContext.jsx";
import {useForceUpdate} from "../hooks/index.js";
import {useDelay} from "../hooks/index.js";

const BoardEmpty = props => (
    <div className="select-none bg-neutral-100 w-full rounded-lg">
        <div className="w-full py-16 flex flex-col items-center">
            <div className="flex text-7xl text-neutral-950">
                <DrawingIcon />
            </div>
            <div className="font-black text-2xl text-neutral-900 mt-2">
                <span>No boards yet...</span>
            </div>
            <div className="text-sm text-neutral-600">
                Create your first board to start sketching.
            </div>
            <div className="mt-4">
                <Button variant="primary" onClick={props.onCreate}>
                    <strong>Create a new board</strong>
                </Button>
            </div>
            <div className="mt-1">
                <div className="text-center hover:underline cursor-pointer" onClick={props.onLoad}>
                    <span className="text-xs text-neutral-600">Or import from a local file...</span>
                </div>
            </div>
        </div>
    </div>
);

const BoardItem = props => (
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

const BoardActionButton = props => (
    <div className="cursor-pointer" onClick={props.onClick}>
        <div className="rounded-md hover:bg-neutral-200 text-neutral-600 hover:text-neutral-800 flex items-center gap-1 p-2">
            <div className="text-lg flex">
                {renderIcon(props.icon)}
            </div>
            <div className="text-xs font-bold">
                <span>{props.text}</span>
            </div>
        </div>
    </div>
);

const BoardList = props => {
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
                    <div className="text-5xl font-black leading-none">
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
    showCreate: true,
    showLoad: true,
    onCreate: null,
    onLoad: null,
    onBoardClick: null,
    onBoardSave: null,
    onBoardDelete: null,
    onBoardDuplicate: null,
};

// Dashboard page
export default props => {
    const client = useClient();
    const [updateKey, forceUpdate] = useForceUpdate();
    const {showConfirm} = useConfirm();
    return (
        <div className="w-full mt-4">
            <Alert variant="default">
                <AlertIcon className="text-lg animation-pulse">
                    <ExclamationTriangleIcon />
                </AlertIcon>
                <AlertTitle>Folio is still a Work in Progress</AlertTitle>
                <AlertDescription>
                    You might encounter occasional bugs or experience features that are still being refined. 
                    We appreciate your patience and understanding as we work to deliver the best possible drawing experience.
                </AlertDescription>
            </Alert>
            <div className="mt-12">
                <BoardList
                    key={updateKey}
                    title="Your boards"
                    data={() => client.getUserBoards()}
                    onCreate={props.onCreate}
                    onLoad={() => {
                        loadFromJson()
                            .then(data => client.addBoard(data))
                            .then(response => props.onOpen(response.id))
                            .catch(error => console.error(error));
                    }}
                    onBoardClick={props.onOpen}
                    onBoardSave={boardId => {
                        client.getBoard(boardId)
                            .then(data => saveAsJson(data))
                            .catch(error => console.error(error));
                    }}
                    onBoardDelete={boardId => {
                        showConfirm({
                            title: "Delete board",
                            message: "Are you sure? This action can not be undone.",
                            callback: () => {
                                client.deleteBoard(boardId)
                                    .then(() => {
                                        // TODO: display a confirmation message
                                        forceUpdate();
                                    })
                                    .catch(error => console.error(error));
                            },
                        });
                    }}
                    onBoardDuplicate={boardId => {
                        client.getBoard(boardId)
                            .then(data => {
                                return client.addBoard({
                                    ...data,
                                    title: `${data.title} - Copy`,
                                    createdAt: Date.now(),
                                    updatedAt: Date.now(),
                                });
                            })
                            .then(() => {
                                // TODO: display confirmation message
                                forceUpdate();
                            })
                            .catch(error => console.error(error));
                    }}
                />
            </div>
        </div>
    );
};
