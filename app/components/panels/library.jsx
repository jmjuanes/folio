import React from "react";
import {AlbumIcon, PlusIcon, UploadIcon, TrashIcon} from "@josemi-icons/react";
import {Panel} from "../ui/panel.jsx";
import {themed} from "../../contexts/theme.jsx";
import {useLibrary} from "../../contexts/library.jsx";

const EmptyLibrary = () => (
    <div className={themed("flex flex-col items-center justify-center gap-1 py-12", "library.empty")}>
        <div className="flex items-center text-4xl">
            <AlbumIcon />
        </div>
        <div className="text-center font-bold text-sm">Your Library</div>
        <div className="text-center text-2xs font-medium px-4">
            <span>Library lets you to organize and share your elements across boards.</span>
        </div>
    </div>
);

// @description library item
const LibraryItem = ({thumbnail, onClick}) => (
    <div className="group relative border border-neutral-200 rounded-lg overflow-hidden cursor-pointer" onClick={onClick}>
        <img src={thumbnail} width="100%" height="100%" />
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-neutral-900 opacity-0 group-hover:opacity-80 flex items-center justify-center">
            <div className="text-white text-lg flex">
                <PlusIcon />
            </div>
        </div>
    </div>
);

export const LibraryPanel = props => {
    const library = useLibrary();
    return (
        <Panel className={themed("w-72", "library", props.className)}>
            <Panel.Header className="">
                <Panel.HeaderTitle>Library</Panel.HeaderTitle>
                <div className="flex items-center gap-1">
                    <Panel.HeaderButton onClick={props.onClear}>
                        <TrashIcon />
                    </Panel.HeaderButton>
                    <Panel.HeaderButton onClick={props.onLoad}>
                        <UploadIcon />
                    </Panel.HeaderButton>
                </div>
            </Panel.Header>
            <Panel.Body className="overflow-y-auto" style={{maxHeight:"calc(100vh - 8rem)"}}>
                {library.items.length > 0 && (
                    <div className="grid gap-2 grid-cols-4">
                        {library.items.map(item => (
                            <LibraryItem
                                key={item.id}
                                thumbnail={item.thumbnail}
                                onClick={() => props.onInsert(item.id, item)}
                            />
                        ))}
                    </div>
                )}
                {library.items.length === 0 && (
                    <EmptyLibrary />
                )}
            </Panel.Body>
        </Panel>
    );
};
