import React from "react";
import { AlbumIcon, PlusIcon, ChevronLeftIcon } from "@josemi-icons/react";
import { renderIcon } from "@josemi-icons/react";
import classNames from "classnames";
import { ACTIONS } from "../constants.js";
import { Button } from "../components/ui/button.jsx";
import { useLibrary } from "../contexts/library.tsx";
import { useActions } from "../hooks/use-actions.js";
import { formatDate } from "../utils/dates.ts";
import type { LibraryCollection, LibraryComponent, Library } from "../lib/library.ts";

type EmptyLibraryProps = {
    icon: string;
    title: string;
    description: string;
};

// @description display an empty library message
const EmptyLibrary = (props: EmptyLibraryProps): React.JSX.Element => (
    <div className="flex flex-col items-center justify-center gap-1 py-12 bg-gray-100 rounded-lg">
        <div className="flex items-center text-5xl">
            {renderIcon(props.icon)}
        </div>
        <div className="text-center font-bold text-base">
            <span>{props.title}</span>
        </div>
        <div className="text-center text-xs font-medium px-4 opacity-60">
            <span>{props.description}</span>
        </div>
    </div>
);

export type LibraryComponentIconProps = {
    thumbnail: string;
    onClick: () => void;
};

// @description library item
export const LibraryComponentIcon = ({ thumbnail, onClick }: LibraryComponentIconProps): React.JSX.Element => (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={onClick}> 
        <img src={thumbnail} width="100%" height="100%" />
    </div>
);

export type LibraryCollectionIconProps = {
    name: string;
    components: LibraryComponent[];
    onClick: () => void;
};

export const LibraryCollectionIcon = (props: LibraryCollectionIconProps): React.JSX.Element => {
    const visibleComponents = props.components.slice(0, 4);
    return (
        <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden" onClick={props.onClick}>
            <div className="grid grid-cols-2 w-full border-b-2 border-gray-200 bg-gray-200 gap-1">
                {props.components.slice(0, 4).map(item => (
                    <div key={item.id} className="h-14 w-full overflow-hidden bg-gray-100">
                        <img src={item.thumbnail} width="100%" height="100%" />
                    </div>
                ))}
                {Array.from({ length: 4 - visibleComponents.length }, (_, index) => (
                    <div key={"item-" + index} className="h-14 w-full bg-gray-100" />
                ))}
            </div>
            <div className="w-full p-2 flex flex-col gap-0">
                <div className="font-bold w-content max-w-32 truncate">
                    <span>{props.name}</span>
                </div>
                <div className="text-2xs opacity-60">
                    <span>{props.components.length} component(s)</span>
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
        <div className="flex text-base">
            {renderIcon(props.icon)}
        </div>
        <div className="text-sm">{props.text}</div>
    </div>
);

// @description library container
export const Library = (): React.JSX.Element => {
    const [ activeCollection, setActiveCollection ] = React.useState<LibraryCollection>(null);
    const [ activeComponent, setActiveComponent ] = React.useState<LibraryIem>(null);
    const library = useLibrary();
    const dispatchAction = useActions();
    const components = library?.getComponents() || [];
    const collections = library?.getCollections() || [];

    // get visible components
    const visibleComponents = React.useMemo<LibraryComponent[]>(() => {
        if (!activeComponent && components.length > 0) {
            // 1. a collection is active, we will display the items on this collection
            if (activeCollection) {
                return components.filter((item: LibraryComponent) => {
                    return item.collection === activeCollection?.id;
                });
            }
            // 2. display only the items without a collection
            // return items.filter((item: LibraryComponent) => !item.collection);
            return components;
        }
        return [];
    }, [ components.length, collections.length, activeCollection, activeComponent ]);

    // hook to check if we have to clear the active collection or the active item
    React.useEffect(() => {
        // if we have an active item, check if this item is still in the items array
        if (activeComponent) {
            if (!components.find((item: LibraryComponent) => item.id === activeComponent?.id)) {
                setActiveComponent(null);
            }
        }
        // if we have an active collection, check if this collection is still in the
        // collections array
        if (activeCollection) {
            if (!collections.find((collection: LibraryCollection) => collection.id === activeCollection?.id)) {
                setActiveCollection(null);
            }
        }
    }, [ components.length, collections.length ]);

    return (
        <div className="flex flex-col gap-4">
            <div className="sticky top-0 bg-white flex items-center justify-between pb-2 z-20">
                {!activeCollection && !activeComponent && (
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
                {activeCollection && !activeComponent && (
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
                {activeComponent && (
                    <React.Fragment>
                        <LibraryHeaderTitle
                            showBackButton={true}
                            onBackButtonClick={() => setActiveComponent(null)}
                            title="Details"
                        />
                        <div className="flex items-center gap-1">
                            <LibraryHeaderButton
                                icon="pencil"
                                disabled={false}
                                onClick={() => {
                                    dispatchAction(ACTIONS.EDIT_LIBRARY_COMPONENT, activeComponent);
                                }}
                            />
                            <LibraryHeaderButton
                                icon="trash"
                                disabled={false}
                                onClick={() => {
                                    dispatchAction(ACTIONS.DELETE_LIBRARY_COMPONENT, activeComponent);
                                }}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
            {activeComponent && (
                <div className="flex flex-col gap-4">
                    <div className="w-full">
                        <LibraryComponentIcon
                            key={activeComponent?.id}
                            thumbnail={activeComponent.thumbnail}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-base">
                            <span>{activeComponent?.name || "Untitled"}</span>
                        </div>
                        {activeComponent?.description && (
                            <div className="text-sm opacity-60">{activeComponent.description}</div>
                        )}
                        {activeComponent?.collection && (
                            <LibraryDetail
                                icon="album"
                                text={library?.getCollection(activeComponent.collection)?.name || "Untitled"}
                            />
                        )}
                        {activeComponent?.created && (
                            <LibraryDetail
                                icon="calendar-plus"
                                text={"Created at " + formatDate(activeComponent.created)}
                            />
                        )}
                    </div>
                    <Button variant="primary" onClick={() => dispatchAction(ACTIONS.INSERT_LIBRARY_COMPONENT, activeComponent)}>
                        <div className="flex items-center text-base">
                            <PlusIcon />
                        </div>
                        <span>Insert Component</span>
                    </Button>
                </div>
            )}
            {collections.length > 0 && !activeCollection && !activeComponent && (
                <div className="flex flex-col gap-2">
                    <div className="font-bold text-base">
                        <span>Collections ({collections.length})</span>
                    </div>
                    <div className="grid gap-2 grid-cols-2 w-full">
                        {collections.map((collection: LibraryCollection) => (
                            <LibraryCollectionIcon
                                key={collection.id}
                                name={collection.name}
                                components={components.filter((item: LibraryComponent) => {
                                    return item.collection === collection.id;
                                })}
                                onClick={() => setActiveCollection(collection)}
                            />
                        ))}
                    </div>
                </div>
            )}
            {visibleComponents.length > 0 && (
                <div className="flex flex-col gap-2">
                    {!activeCollection && (
                        <div className="font-bold text-base">
                            <span>All components ({visibleComponents.length})</span>
                        </div>
                    )}
                    <div className="grid gap-2 grid-cols-2">
                        {visibleComponents.map((item: LibraryComponent) => (
                            <LibraryComponentIcon
                                key={item.id}
                                thumbnail={item.thumbnail}
                                onClick={() => setActiveComponent(item)}
                            />
                        ))}
                    </div>
                </div>
            )}
            {activeCollection && !activeComponent && visibleComponents.length === 0 && (
                <EmptyLibrary
                    icon="album"
                    title="This collection is empty"
                    description="Collections allows you to organize your components."
                />
            )}
            {components.length === 0 && collections.length === 0 && (
                <EmptyLibrary
                    icon="album"
                    title="Your Library is empty"
                    description="Library lets you to organize and share your elements across pages."
                />
            )}
        </div>
    );
};
