import React from "react";
import {AlbumIcon, PlusIcon, CloseIcon} from "@josemi-icons/react";
import {Dropdown} from "../ui/dropdown.jsx";
import {Island} from "../ui/island.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useDialog} from "../../contexts/dialogs.jsx";
import {useConfirm} from "../../contexts/confirm.jsx";
import {loadLibraryFromJson} from "../../library.js";
import {clearFocus} from "../../utils/dom.js";

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

// @description library item
const LibraryItem = ({thumbnail, onInsert, onDelete}) => (
    <div className="relative">
        <div className="relative border border-neutral-200 rounded-lg overflow-hidden cursor-pointer" onClick={onInsert}> 
            <img src={thumbnail} width="100%" height="100%" />
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-neutral-900 opacity-0 hover:opacity-80 flex items-center justify-center z-10">
                <div className="text-white text-lg flex">
                    <PlusIcon />
                </div>
            </div>
        </div>
        <div className="absolute group-hover:opacity-100 opacity-0 z-20" style={{top:"-0.5rem",right:"-0.5rem"}} onClick={onDelete}>
            <div className="flex p-1 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-950 cursor-pointer">
                <CloseIcon />
            </div>
        </div>
    </div>
);

// @description library menu
export const LibraryMenu = () => {
    const editor = useEditor();
    const {showConfirm} = useConfirm();
    const {showDialog} = useDialog();

    // handle loading a library from JSON
    const handleLibraryLoad = React.useCallback(() => {
        return loadLibraryFromJson()
            .then(importedLibrary => {
                editor.importLibrary(importedLibrary);
                editor.dispatchLibraryChange();
                editor.update();
            })
            .catch(error => {
                console.error(error);
            });
    }, [editor]);

    // handle clearing the library
    const handleLibraryClear = React.useCallback(() => {
        clearFocus();
        showConfirm({
            title: "Delete library",
            message: `Do you want to delete your library? This action can not be undone.`,
            callback: () => {
                editor.clearLibrary();
                editor.dispatchLibraryChange();
                editor.update();
            },
        });
    }, [editor, showConfirm]);

    // handle exporting the library
    const handleLibraryExport = React.useCallback(() => {
        clearFocus();
        showDialog("library-export", {});
    }, [showDialog]);

    // inject an item into the editor
    // @param {object} item library item to insert
    // @param {number} x the x position to insert the item
    // @param {number} y the y position to insert the item
    const handleInsertItem = React.useCallback(item => {
        editor.addLibraryElement(item);
        editor.dispatchChange();
        editor.update();
        clearFocus();
    }, [editor]);

    // handle deleting an item from the library
    // @param {object} item library item to delete
    const handleDeleteItem = React.useCallback(item => {
        clearFocus();
        showConfirm({
            title: "Delete library item",
            message: `Do you want to delete '${item.name}'? This action can not be undone.`,
            callback: () => {
                editor.removeLibraryItem(item.id);
                editor.dispatchLibraryChange();
                editor.update();
            },
        });
    }, [editor, showConfirm]);

    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button icon="album" />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-64 z-40">
                <Dropdown.Header>
                    <div className="text-sm font-bold mr-auto">Library</div>
                    <Dropdown.HeaderButton
                        icon="folder"
                        onClick={handleLibraryLoad}
                    />
                    <Dropdown.HeaderButton
                        icon="download"
                        disabled={editor.library.items.length === 0}
                        onClick={handleLibraryExport}
                    />
                    <Dropdown.HeaderButton
                        icon="trash"
                        disabled={editor.library.items.length === 0}
                        onClick={handleLibraryClear}
                    />
                </Dropdown.Header>
                <div className="overflow-x-hidden overflow-y-auto scrollbar" style={{maxHeight:"50vh"}}>
                    <div className="grid gap-2 grid-cols-4">
                        {editor.getLibraryItems().map(item => (
                            <LibraryItem
                                key={item.id}
                                thumbnail={item.thumbnail}
                                onInsert={() => handleInsertItem(item)}
                                onDelete={() => handleDeleteItem(item)}
                            />
                        ))}
                    </div>
                    {editor.library.items.length === 0 && (
                        <EmptyLibrary />
                    )}
                </div>
            </Dropdown>
        </div>
    );
};
