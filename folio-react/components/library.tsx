import React from "react";
import { AlbumIcon, PlusIcon, CloseIcon } from "@josemi-icons/react";
import { ACTIONS } from "../constants.js";
import { useEditor } from "../contexts/editor.jsx";
import { useConfirm } from "../contexts/confirm.jsx";
import { useLibrary } from "../contexts/library.tsx";
import { useActions } from "../hooks/use-actions.js";
import { loadLibraryFromJson } from "../lib/library.ts";
import { clearFocus } from "../utils/dom.js";

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

// @description library container
export const Library = (): React.JSX.Element => {
    const editor = useEditor();
    const library = useLibrary();
    const dispatchAction = useActions();
    const { showConfirm } = useConfirm();

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
        showConfirm({
            title: "Delete library",
            message: `Do you want to delete your library? This action can not be undone.`,
            callback: () => {
                library.clear();
            },
        });
    }, [ library, showConfirm ]);

    // handle exporting the library
    const handleLibraryExport = React.useCallback(() => {
        clearFocus();
        dispatchAction(ACTIONS.SHOW_LIBRARY_EXPORT_DIALOG, {});
    }, [dispatchAction]);

    // inject an item into the editor
    // @param {object} item library item to insert
    // @param {number} x the x position to insert the item
    // @param {number} y the y position to insert the item
    const handleInsertItem = React.useCallback((item: any) => {
        editor.addLibraryElement(item);
        editor.dispatchChange();
        editor.update();
        clearFocus();
    }, [editor]);

    // handle deleting an item from the library
    // @param {object} item library item to delete
    const handleDeleteItem = React.useCallback((item: any) => {
        showConfirm({
            title: "Delete library item",
            message: `Do you want to delete this item from the library? This action can not be undone.`,
            callback: () => {
                editor.removeLibraryItem(item.id);
                editor.dispatchLibraryChange();
                editor.update();
            },
        });
    }, [editor, showConfirm]);

    return (
        <React.Fragment>
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
                <div className="grid gap-2 grid-cols-4 pt-2">
                    {editor.getLibraryItems().map((item: any) => (
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
        </React.Fragment>
    );
};
