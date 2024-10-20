import React from "react";
import {AlbumIcon, BoxSelectionIcon, PlusIcon, UploadIcon, renderIcon} from "@josemi-icons/react";
import {Panel} from "../ui/panel.jsx";
import {themed} from "../../contexts/theme.jsx";
import {useLibraries} from "../../contexts/libraries.jsx";

const EmptyUserLibraries = () => (
    <div className={themed("flex flex-col items-center justify-center gap-1 py-12", "libraries.empty")}>
        <div className="flex items-center text-4xl">
            <AlbumIcon />
        </div>
        <div className="text-center font-bold text-sm">Libraries</div>
        <div className="text-center text-2xs font-medium px-4">Libraries let you to organize and share your elements across boards.</div>
    </div>
);

// @description renders a library item action button
const LibraryAction = props => (
    <div className={themed("flex text-base cursor-pointer", "libraries.item.action")} onClick={props.onClick}>
        {renderIcon(props.icon)}
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

// @description render the items of a library
const Library = props => {
    return (
        <div className="">
            <div className="flex items-center justify-between py-2">
                <div className="text-xs font-bold">{props.library.name || "Untitled"}</div>
                <div className="flex items-center gap-2">
                    <LibraryAction icon="pencil" />
                    <LibraryAction icon="download" onClick={props.onDownload} />
                    <LibraryAction icon="trash" onClick={props.onDelete} />
                </div>
            </div>
            {props.library.items.length > 0 && (
                <div className="grid gap-2 grid-cols-4">
                    {props.library.items.map(item => (
                        <LibraryItem
                            key={item.id}
                            thumbnail={item.thumbnail}
                            onClick={() => props.onInsert(item.id, item)}
                        />
                    ))}
                </div>
            )}
            {props.library.items.length === 0 && (
                <div className={themed("flex flex-col gap-1 items-center justify-center p-4 rounded-lg", "libraries.item.empty")}>
                    <div className="flex items-center text-xl">
                        <BoxSelectionIcon />
                    </div>
                    <div className="text-2xs">This library is empty.</div>
                </div>
            )}
        </div>
    );
};

export const LibrariesPanel = props => {
    const libraries = useLibraries();
    const allLibraries = libraries.getAll();
    return (
        <Panel className={themed("w-72", "libraries", props.className)}>
            <Panel.Header className="">
                <Panel.HeaderTitle>Libraries</Panel.HeaderTitle>
                <div className="flex items-center gap-1">
                    <Panel.HeaderButton onClick={props.onCreate}>
                        <PlusIcon />
                    </Panel.HeaderButton>
                    <Panel.HeaderButton onClick={props.onLoad}>
                        <UploadIcon />
                    </Panel.HeaderButton>
                </div>
            </Panel.Header>
            <Panel.Body className="overflow-y-auto" style={{maxHeight:"calc(100vh - 8rem)"}}>
                {allLibraries.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {allLibraries.map(library => (
                            <Library
                                key={library.id}
                                library={library}
                                onDelete={() => props.onDelete(library.id, library)}
                                onDownload={() => props.onDownload(library.id, library)}
                                onInsert={(id, item) => props.onInsert(id, item, library)}
                            />
                        ))}
                    </div>
                )}
                {allLibraries.length === 0 && (
                    <EmptyUserLibraries />
                )}
            </Panel.Body>
        </Panel>
    );
};
