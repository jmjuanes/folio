import React from "react";
import { AlbumIcon, PlusIcon, ChevronLeftIcon } from "@josemi-icons/react";
import { renderIcon } from "@josemi-icons/react";
import classNames from "classnames";
import { ACTIONS } from "../constants.js";
import { Button } from "../components/ui/button.jsx";
import { useLibrary } from "../contexts/library.tsx";
import { useActions } from "../hooks/use-actions.js";
import { formatDate } from "../utils/dates.ts";
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
    thumbnail: string;
    onClick: () => void;
};

// @description library item
export const LibraryItemIcon = ({ thumbnail, onClick }: LibraryItemIconProps): React.JSX.Element => (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={onClick}> 
        <img src={thumbnail} width="100%" height="100%" />
    </div>
);

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
        <div className="font-bold text-lg w-32 truncate">
            <span>{props.title}</span>
        </div>
    </div>
);

export type LibraryHeaderButtonProps = {
    icon: string;
    disabled?: boolean;
    onClick?: () => void;
};

export const LibraryHeaderButton = (props: LibraryHeaderButtonProps): React.JSX.Element => {
    const className = classNames({
        "flex items-center p-2 rounded-lg": true,
        "bg-gray-100 hover:bg-gray-200 cursor-pointer": true,
    });
    return (
        <div className={className} onClick={props.onClick}>
            {renderIcon(props.icon)}
        </div>
    );
};

export type LibraryDetailProps = {
    icon: string;
    text: string;
};

export const LibraryDetail = (props: LibraryDetailProps): React.JSX.Element => (
    <div className="flex items-center gap-2 opacity-60">
        <div className="flex text-base pt-px">
            {renderIcon(props.icon)}
        </div>
        <div className="text-sm">{props.text}</div>
    </div>
);

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
            // return items.filter((item: LibraryItem) => !item.collection);
            return items;
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
        <div className="flex flex-col gap-4">
            <div className="sticky top-0 bg-white flex items-center justify-between pb-2 z-20">
                {!activeCollection && !activeItem && (
                    <React.Fragment>
                        <LibraryHeaderTitle
                            showBackButton={false}
                            title="Library"
                        />
                        <div className="flex items-center gap-1">
                            <LibraryHeaderButton
                                icon="plus"
                                disabled={false}
                                onClick={() => dispatchAction(ACTIONS.ADD_LIBRARY_COLLECTION)}
                            />
                            <LibraryHeaderButton
                                icon="folder-open"
                                disabled={false}
                                onClick={() => dispatchAction(ACTIONS.LOAD_LIBRARY)}
                            />
                            <LibraryHeaderButton
                                icon="download"
                                disabled={false}
                                onClick={() => dispatchAction(ACTIONS.EXPORT_LIBRARY)}
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
                                icon="pencil"
                                disabled={false}
                                onClick={() => {
                                    dispatchAction(ACTIONS.EDIT_LIBRARY_COLLECTION, activeCollection);
                                }}
                            />
                            <LibraryHeaderButton
                                icon="download"
                                disabled={false}
                                onClick={() => {
                                    dispatchAction(ACTIONS.EXPORT_LIBRARY_COLLECTION, activeCollection);
                                }}
                            />
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
                    <React.Fragment>
                        <LibraryHeaderTitle
                            showBackButton={true}
                            onBackButtonClick={() => setActiveItem(null)}
                            title="Details"
                        />
                        <div className="flex items-center gap-1">
                            <LibraryHeaderButton
                                icon="pencil"
                                disabled={false}
                                onClick={() => {
                                    dispatchAction(ACTIONS.EDIT_LIBRARY_ITEM, activeItem);
                                }}
                            />
                            <LibraryHeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => {
                                    dispatchAction(ACTIONS.DELETE_LIBRARY_ITEM, activeItem);
                                }}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
            {activeCollection?.description && !activeItem && (
                <div className="opacity-60 text-sm">
                    <span>{activeCollection.description}</span>
                </div>
            )}
            {activeItem && (
                <div className="flex flex-col gap-4">
                    <div className="w-full">
                        <LibraryItemIcon
                            key={activeItem?.id}
                            thumbnail={activeItem.thumbnail}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-base">
                            <span>{activeItem?.name || "Untitled"}</span>
                        </div>
                        {activeItem?.description && (
                            <div className="text-sm opacity-60">{activeItem.description}</div>
                        )}
                        {activeItem?.collection && (
                            <LibraryDetail
                                icon="album"
                                text={library?.getCollection(activeItem.collection)?.name || "Untitled"}
                            />
                        )}
                        {activeItem?.created && (
                            <LibraryDetail
                                icon="calendar"
                                text={"Created at " + formatDate(activeItem.created)}
                            />
                        )}
                    </div>
                    <Button variant="primary" onClick={() => dispatchAction(ACTIONS.INSERT_LIBRARY_ITEM, activeItem)}>
                        <div className="flex items-center text-base">
                            <PlusIcon />
                        </div>
                        <span>Insert</span>
                    </Button>
                </div>
            )}
            {collections.length > 0 && !activeCollection && !activeItem && (
                <div className="flex flex-col gap-2">
                    <div className="font-bold text-base">
                        <span>Collections</span>
                    </div>
                    <div className="grid gap-2 grid-cols-2 w-full">
                        {collections.map((collection: LibraryCollection) => (
                            <LibraryCollectionIcon
                                key={collection.id}
                                name={collection.name}
                                items={items.filter((item: LibraryItem) => {
                                    return item.collection === collection.id;
                                })}
                                onClick={() => setActiveCollection(collection)}
                            />
                        ))}
                    </div>
                </div>
            )}
            {visibleItems.length > 0 && (
                <div className="flex flex-col gap-2">
                    {!activeCollection && (
                        <div className="font-bold text-base">
                            <span>All library items</span>
                        </div>
                    )}
                    <div className="grid gap-2 grid-cols-2">
                        {visibleItems.map((item: LibraryItem) => (
                            <LibraryItemIcon
                                key={item.id}
                                thumbnail={item.thumbnail}
                                onClick={() => setActiveItem(item)}
                            />
                        ))}
                    </div>
                </div>
            )}
            {activeItem && (
                <div className=""></div>
            )}
            {items.length === 0 && collections.length === 0 && (
                <EmptyLibrary />
            )}
        </div>
    );
};
