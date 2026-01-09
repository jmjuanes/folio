import React from "react";
import { AlbumIcon, PlusIcon, CloseIcon } from "@josemi-icons/react";
import { ACTIONS } from "../constants.js";
import { useLibrary } from "../contexts/library.tsx";
import { useActions } from "../hooks/use-actions.js";
import type { LibraryItem } from "../lib/library.ts";

// @description display an empty library message
const EmptyLibrary = () => (
    <div className="flex flex-col items-center justify-center gap-1 py-12">
        <div className="flex items-center text-4xl">
            <AlbumIcon />
        </div>
        <div className="text-center font-bold text-sm">Your Library</div>
        <div className="text-center text-2xs font-medium px-4">
            <span>Library lets you to organize and share your elements across pages.</span>
        </div>
    </div>
);

export type LibraryItemProps = {
    thumbnail: string,
    onInsert: () => void,
    onDelete: () => void,
};

// @description library item
export const LibraryItem = ({ thumbnail, onInsert, onDelete }: LibraryItemProps): React.JSX.Element => {
    // this is a TEMPORARY solution to show the delete button on hover
    // this should be replaced with a proper context menu or something similar that works on touch devices
    const [isHovered, setIsHovered] = React.useState(false);

    // when the user hovers over the library item, show the delete button
    const handleMouseEnter = React.useCallback(() => {
        setIsHovered(true);
    }, []);

    // when the user stops hovering over the library item, hide the delete button
    const handleMouseLeave = React.useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className="relative border-1 border-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={onInsert}> 
                <img src={thumbnail} width="100%" height="100%" />
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-900 opacity-0 hover:opacity-80 flex items-center justify-center z-10">
                    <div className="text-white text-lg flex">
                        <PlusIcon />
                    </div>
                </div>
            </div>
            {isHovered && (
                <div className="absolute z-20" style={{top:"-0.3rem",right:"-0.3rem"}} onClick={onDelete}>
                    <div className="flex p-1 rounded-full bg-white hover:bg-gray-100 border-1 border-gray-200 text-gray-950 cursor-pointer">
                        <CloseIcon />
                    </div>
                </div>
            )}
        </div>
    );
};

export type LibraryCollectionProps = {
    name: string;
    items: LibraryItem[];
    onClick: () => void;
};

export const LibraryCollection = (props: LibraryCollectionProps): React.JSX.Element => {
    return (
        <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden" onClick={props.onClick}>
            <div className="grid grid-cols-2 w-full border-b-2 border-gray-200 bg-gray-100">
                {props.items.slice(0, 4).map(item => {
                    <div className="h-12 w-full">
                        <img src={item.thumbnail} width="100%" height="100%" />
                    </div>
                })}
            </div>
            <div className="w-full py-2 flex flex-col gap-2">
                <div className="font-bold">{props.name}</div>
                <div className="text-xs opacity-60">{props.items.length} item(s)</div>
            </div>
        </div>
    );
};

// @description library container
export const Library = (): React.JSX.Element => {
    const [ activeCollection, setActiveCollection ] = React.useState("");
    const [ activeItem, setActiveItem ] = React.useState("");
    const library = useLibrary();
    const dispatchAction = useActions();
    const libraryItems = library?.getItems() || [];
    const collection = "Personal Library";

    return (
        <React.Fragment>
            <div className="sticky top-0 bg-white flex items-center gap-2">
                <div className="font-bold">Library</div>
            </div>
            {libraryItems.length > 0 && !activeCollection && (
                <div className="grid gap-2 grid-cols-2 pt-2 w-full">
                    <LibraryCollection
                        name={collection}
                        items={libraryItems}
                        onClick={() => {
                            setActiveCollection(collection);
                        }}
                    />
                </div>
            )}
            {libraryItems.length > 0 && activeCollection && (
                <div className="grid gap-2 grid-cols-4 pt-2">
                    {libraryItems.map((item: any) => (
                        <LibraryItem
                            key={item.id}
                            thumbnail={item.thumbnail}
                            onInsert={() => dispatchAction(ACTIONS.INSERT_LIBRARY_ITEM, item)}
                            onDelete={() => dispatchAction(ACTIONS.DELETE_LIBRARY_ITEM, item)}
                        />
                    ))}
                </div>
            )}
            {libraryItems.length === 0 && (
                <EmptyLibrary />
            )}
        </React.Fragment>
    );
};
