import React from "react";
import { AlbumIcon, PlusIcon, CloseIcon, ChevronLeftIcon } from "@josemi-icons/react";
import { renderIcon } from "@josemi-icons/react";
import classNames from "classnames";
import { ACTIONS } from "../constants.js";
import { useLibrary } from "../contexts/library.tsx";
import { useActions } from "../hooks/use-actions.js";
import type { LibraryCollection, LibraryItem, Library } from "../lib/library.ts";

// @description display an empty library message
const EmptyLibrary = (): React.JSX.Element => (
    <div className="flex flex-col items-center justify-center gap-1 py-12">
        <div className="flex items-center text-4xl">
            <AlbumIcon />
        </div>
        <div className="text-center font-bold text-sm">
            <span>Your Library is empty.</span>
        </div>
        <div className="text-center text-2xs font-medium px-4">
            <span>Library lets you to organize and share your elements across pages.</span>
        </div>
    </div>
);

export type LibraryItemIconProps = {
    thumbnail: string,
    onInsert: () => void,
    onDelete: () => void,
};

// @description library item
export const LibraryItemIcon = ({ thumbnail, onInsert, onDelete }: LibraryItemIconProps): React.JSX.Element => {
    // this is a TEMPORARY solution to show the delete button on hover
    // this should be replaced with a proper context menu or something similar that works on touch devices
    const [ isHovered, setIsHovered ] = React.useState(false);

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

export type LibraryCollectionIconProps = {
    name: string;
    items: LibraryItem[];
    onClick: () => void;
};

export const LibraryCollectionIcon = (props: LibraryCollectionIconProps): React.JSX.Element => {
    const visibleItems = props.items.slice(0, 4);
    return (
        <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden" onClick={props.onClick}>
            <div className="grid grid-cols-2 w-full border-b-2 border-gray-200 bg-gray-200 gap-1">
                {props.items.slice(0, 4).map(item => (
                    <div key={item.id} className="h-14 w-full overflow-hidden bg-gray-100">
                        <img src={item.thumbnail} width="100%" height="100%" />
                    </div>
                ))}
                {Array.from({ length: 4 - visibleItems.length }, (_, index) => (
                    <div key={"item-" + index} className="h-14 w-full bg-gray-100" />
                ))}
            </div>
            <div className="w-full p-2 flex flex-col gap-0">
                <div className="font-bold w-content max-w-32 truncate">
                    <span>{props.name}</span>
                </div>
                <div className="text-2xs opacity-60">
                    <span>{props.items.length} item(s)</span>
                </div>
            </div>
        </div>
    );
};

export type LibraryHeaderTitleProps = {
    title: string;
    showBackButton: boolean;
    onBackButtonClick?: () => void;
};

export const LibraryHeaderTitle = (props: LibraryHeaderTitleProps): React.JSX.Element => (
    <div className="flex items-center gap-2 w-full">
        {props.showBackButton && (
            <div className="flex items-center text-xl" onClick={props.onBackButtonClick}>
                <ChevronLeftIcon />
            </div>
        )}
        <div className="font-bold text-lg">{props.title}</div>
    </div>
);

export type LibraryHeaderButtonProps = {
    icon: string;
    disabled?: boolean;
    onClick?: () => void;
};

export const LibraryHeaderButton = (props: LibraryHeaderButtonProps): React.JSX.Element => {
    const className = classNames({
        "flex items-center p-2 rounded-lg bg-gray-100 cursor-pointer": true,
    });
    return (
        <div className={className} onClick={props.onClick}>
            {renderIcon(props.icon)}
        </div>
    );
};

// @description library container
export const Library = (): React.JSX.Element => {
    const [ activeCollection, setActiveCollection ] = React.useState<LibraryCollection>(null);
    const [ activeItem, setActiveItem ] = React.useState<LibraryIem>(null);
    const library = useLibrary();
    const dispatchAction = useActions();
    const items = library?.getItems() || [];
    const collections = library?.getCollections() || [];

    // get visible items
    const visibleItems = React.useMemo<libraryItems[]>(() => {
        if (!activeItem && items.length > 0) {
            // 1. a collection is active, we will display the items on this collection
            if (activeCollection) {
                return items.filter((item: LibraryItem) => {
                    return item.collection === activeCollection?.id;
                });
            }
            // 2. display only the items without a collection
            return items.filter((item: LibraryItem) => !item.collection);
        }
        return [];
    }, [ items.length, collections.length, activeCollection, activeItem ]);

    // hook to check if we have to clear the active collection or the active item
    React.useEffect(() => {
        // if we have an active item, check if this item is still in the items array
        if (activeItem) {
            if (!items.find((item: LibraryItem) => item.id === activeItem?.id)) {
                setActiveItem(null);
            }
        }
        // if we have an active collection, check if this collection is still in the
        // collections array
        if (activeCollection) {
            if (!collections.find((collection: LibraryCollection) => collection.id === activeCollection?.id)) {
                setActiveCollection(null);
            }
        }
    }, [ items.length, collections.length ]);

    return (
        <React.Fragment>
            <div className="sticky top-0 bg-white flex items-center justify-between">
                {!activeCollection && !activeItem && (
                    <React.Fragment>
                        <LibraryHeaderTitle
                            showBackButton={false}
                            title="Your Library"
                        />
                        <div className="flex items-center gap-1">
                            <LibraryHeaderButton
                                icon="plus"
                                disabled={false}
                                onClick={() => {
                                    library.addCollection({
                                        name: "Test"
                                    });
                                }}
                            />
                            <LibraryHeaderButton
                                icon="folder-open"
                                disabled={false}
                                onClick={() => dispatchAction(ACTIONS.LOAD_LIBRARY)}
                            />
                            <LibraryHeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => dispatchAction(ACTIONS.CLEAR_LIBRARY)}
                            />
                        </div>
                    </React.Fragment>
                )}
                {activeCollection && !activeItem && (
                    <React.Fragment>
                        <LibraryHeaderTitle
                            showBackButton={true}
                            onBackButtonClick={() => setActiveCollection(null)}
                            title={activeCollection?.name}
                        />
                        <div className="flex items-center gap-1">
                            <LibraryHeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => {
                                    dispatchAction(ACTIONS.DELETE_LIBRARY_COLLECTION, activeCollection);
                                }}
                            />
                        </div>
                    </React.Fragment>
                )}
                {activeItem && (
                    <LibraryHeaderTitle
                        showBackButton={true}
                        onBackButtonClick={() => setActiveItem(null)}
                        title="Library Item"
                    />
                )}
            </div>
            {collections.length > 0 && !activeCollection && (
                <div className="grid gap-2 grid-cols-2 pt-2 w-full">
                    {collections.map((collection: LibraryCollection) => (
                        <LibraryCollectionIcon
                            key={collection.id}
                            name={collection.name}
                            items={items.filter(item => item.collection === collection.id)}
                            onClick={() => {
                                setActiveCollection(collection);
                            }}
                        />
                    ))}
                </div>
            )}
            {visibleItems.length > 0 && (
                <div className="grid gap-2 grid-cols-4 pt-4">
                    {visibleItems.map((item: LibraryItem) => (
                        <LibraryItemIcon
                            key={item.id}
                            thumbnail={item.thumbnail}
                            onInsert={() => dispatchAction(ACTIONS.INSERT_LIBRARY_ITEM, item)}
                            onDelete={() => dispatchAction(ACTIONS.DELETE_LIBRARY_ITEM, item)}
                        />
                    ))}
                </div>
            )}
            {items.length === 0 && collections.length === 0 && (
                <EmptyLibrary />
            )}
        </React.Fragment>
    );
};
