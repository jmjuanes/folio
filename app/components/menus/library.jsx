import React from "react";
import {AlbumIcon, PlusIcon, FolderIcon, TrashIcon, DownloadIcon, CloseIcon} from "@josemi-icons/react";
import {Dropdown} from "../ui/dropdown.jsx";
import {Island} from "../ui/island.jsx";
import {themed} from "../../contexts/theme.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useLibrary} from "../../contexts/library.jsx";
import {useDialog} from "../../contexts/dialogs.jsx";
import {useConfirm} from "../../contexts/confirm.jsx";
import {loadLibraryFromJson} from "../../library.js";
import {clearFocus} from "../../utils/dom.js";

const PERSONAL_LIBRARY_ID = "personal";
const PERSONAL_LIBRARY_NAME = "Personal";

// generate the list of groups to display in the panel with the correct order
const getGroupsNames = groups => {
    const groupsNames = Object.keys(groups);
    // make sure that personal library is always displayed first
    if (groupsNames.includes(PERSONAL_LIBRARY_ID)) {
        groupsNames.splice(groupsNames.indexOf(PERSONAL_LIBRARY_ID), 1);
        groupsNames.unshift(PERSONAL_LIBRARY_ID);
    }
    return groupsNames;
};

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
const LibraryItem = ({name, thumbnail, showDelete, onInsert, onDelete}) => (
    <div className="group relative">
        <div className="relative border border-neutral-200 rounded-lg overflow-hidden cursor-pointer" onClick={onInsert}> 
            <img src={thumbnail} width="100%" height="100%" />
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-neutral-900 opacity-0 group-hover:opacity-80 flex items-center justify-center z-10">
                <div className="text-white text-lg flex">
                    <PlusIcon />
                </div>
            </div>
        </div>
        {showDelete && (
            <div className="absolute group-hover:opacity-100 opacity-0 z-20" style={{top:"-0.5rem",right:"-0.5rem"}} onClick={onDelete}>
                <div className="flex p-1 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-950 cursor-pointer">
                    <CloseIcon />
                </div>
            </div>
        )}
    </div>
);

// @description library menu
export const LibraryMenu = () => {
    const editor = useEditor();
    const {showConfirm} = useConfirm();
    const {showDialog} = useDialog();
    const library = useLibrary();
    const emptyPersonalLibrary = !library.items.find(item => !item.source);

    const itemsGroups = React.useMemo(() => {
        const groups = {};
        library.items.forEach(item => {
            const libraryId = item.libraryId || PERSONAL_LIBRARY_ID;
            if (!groups[libraryId]) {
                groups[libraryId] = {
                    name: libraryId === PERSONAL_LIBRARY_ID ? PERSONAL_LIBRARY_NAME : item.libraryName,
                    items: [],
                };
            }
            groups[libraryId].items.push(item);
        });
        return groups;
    }, [library.items.length]);

    // handle loading a library from JSON
    const handleLibraryLoad = React.useCallback(() => {
        return loadLibraryFromJson()
            .then(importedLibrary => {
                library.importLibrary(importedLibrary);
                // TODO
                // editor.dispatchLibraryChange();
                editor.update();
            })
            .catch(error => {
                console.error(error);
            });
    }, [editor, library]);

    // handle clearing the library
    const handleLibraryClear = React.useCallback(() => {
        return showConfirm({
            title: "Delete library",
            message: `Do you want to delete your library? This action can not be undone.`,
            callback: () => {
                library.clear();
                // TODO
                // editor.dispatchLibraryChange();
                editor.update();
            },
        });
    }, [editor, library, showConfirm]);

    // handle exporting the library
    const handleLibraryExport = React.useCallback(() => {
        showDialog("library-export", {});
    }, [showDialog]);

    // inject an item into the editor
    // @param {object} item library item to insert
    // @param {number} x the x position to insert the item
    // @param {number} y the y position to insert the item
    const handleInsertItem = React.useCallback((item, x, y) => {
        editor.addLibraryItem(item, tx, ty);
        // TODO
        // editor.dispatchChange();
        editor.update();
        clearFocus();
    }, [editor]);

    // handle deleting an item from the library
    // @param {object} item library item to delete
    const handleDeleteItem = React.useCallback(item => {
        showConfirm({
            title: "Delete library item",
            message: `Do you want to delete '${item.name}'? This action can not be undone.`,
            callback: () => {
                library.delete(item.id);
                // TODO
                // editor.dispatchLibraryChange();
                editor.update();
            },
        });
    }, [editor, library, showConfirm]);

    // handle deleting all items of a group
    // @param {array} ids list of items ids to delete
    const handleDeleteAllItems = React.useCallback(ids => {
        showConfirm({
            title: "Delete library items",
            message: `Do you want to delete ${ids.length} items from the library? This action can not be undone.`,
            callback: () => {
                library.delete(ids);
                // TODO
                // editor.dispatchLibraryChange();
                editor.update();
            },
        });
    }, [editor, library, showConfirm]);

    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button icon="album" />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-72 z-40">
                {/*
                <Panel.Header className="">
                    <Panel.HeaderTitle>Library</Panel.HeaderTitle>
                    <div className="flex items-center gap-1">
                        <Panel.HeaderButton disabled={emptyPersonalLibrary} onClick={props.onExport}>
                            <DownloadIcon />
                        </Panel.HeaderButton>
                        <Panel.HeaderButton onClick={props.onLoad}>
                            <FolderIcon />
                        </Panel.HeaderButton>
                        <Panel.HeaderButton disabled={library.items.length === 0} onClick={props.onClear}>
                            <TrashIcon />
                        </Panel.HeaderButton>
                    </div>
                </Panel.Header>
                */}
                <div className="overflow-y-auto" style={{maxHeight:"calc(75vh - 8rem)"}}>
                    {getGroupsNames(itemsGroups).map(source => {
                        const handleDeleteAll = () => {
                            return handleDeleteAllItems(itemsGroups[source].items.map(item => item.id));
                        };
                        return (
                            <div key={source} className="mb-4 last:mb-0">
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="text-sm text-neutral-900 font-bold">{itemsGroups[source].name}</div>
                                    <div className="flex items-center gap-1">
                                        <div className="flex p-1 rounded-md text-lg text-neutral-900 hover:bg-neutral-100 cursor-pointer" onClick={handleDeleteAll}>
                                            <TrashIcon />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2 grid-cols-4">
                                    {itemsGroups[source].items.map(item => (
                                        <LibraryItem
                                            key={item.id}
                                            name={item.name || "untitled"}
                                            thumbnail={item.thumbnail}
                                            showDelete={source === PERSONAL_LIBRARY_ID}
                                            onInsert={() => handleInsertItem(item, null, null)}
                                            onDelete={() => handleDeleteItem(item)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {library.items.length === 0 && (
                        <EmptyLibrary />
                    )}
                </div>
            </Dropdown>
        </div>
    );
};
