import React from "react";
import {CheckIcon} from "@josemi-icons/react";
import {Button} from "../ui/button.jsx";
import {Centered} from "../ui/centered.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Overlay} from "../ui/overlay.jsx";
import {Form} from "../form/index.jsx";
import {FORM_OPTIONS} from "../../constants.js";
import {useFormData} from "../../hooks/use-form-data.js";
import {useLibrary} from "../../contexts/library.jsx";

// @description library items grid
const LibraryItemsGrid = ({items, selectedItems, onChange}) => (
    <div className="">
        <div className="grid gap-2 grid-cols-8 mb-2 max-h-40 overflow-y-auto">
            {items.map(item => {
                const handleItemClick = () => {
                    selectedItems.has(item.id) ? selectedItems.delete(item.id) : selectedItems.add(item.id);
                    return onChange(selectedItems);
                };
                return (
                    <div key={item.id} onClick={handleItemClick}>
                        <div className="relative border border-neutral-200 rounded-lg overflow-hidden cursor-pointer"> 
                            <img src={item.thumbnail} width="100%" height="100%" />
                            {selectedItems.has(item.id) && (
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-neutral-900 opacity-60 flex items-center justify-center">
                                    <div className="text-white text-lg flex">
                                        <CheckIcon />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="text-2xs text-neutral-600 font-medium">{selectedItems.size} selected.</div>
    </div>
);

// @description Library export dialog
export const LibraryExportDialog = props => {
    const [data, setData] = useFormData({
        selectedItems: new Set(),
    });
    const library = useLibrary();
    const personalLibraryItems = React.useMemo(() => {
        return library.items.filter(item => !item.source); // personal library items does not have a source
    }, [library.items.length]);
    const isSubmitEnabled = data.selectedItems.size > 0 && !!data.name;
    // when the user clicks on select all/unselect all, we have to update the data.selectedItems
    // including all items or none of them
    const handleSelectAll = React.useCallback(() => {
        const newSelectedItems = new Set();
        if (data.selectedItems.size < personalLibraryItems.length) {
            personalLibraryItems.forEach(item => newSelectedItems.add(item.id));
        }
        return setData("selectedItems", newSelectedItems);
    }, [data.selectedItems.size]);
    // check if there are selected items to enable the export button
    const handleSubmit = () => {
        if (isSubmitEnabled) {
            return props.onExport(data);
        }
    };
    return (
        <React.Fragment>
            <Overlay className="z-50" />
            <Centered className="fixed z-50 h-full">
                <Dialog className="max-w-md relative">
                    <Dialog.Close onClick={props.onCancel} />
                    <Dialog.Header className="mb-4">
                        <Dialog.Title>Export Library</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Form
                            data={data}
                            items={{
                                name: {
                                    type: FORM_OPTIONS.TEXT,
                                    title: "Name for the library (Required)",
                                    placeholder: "My Awesome Library",
                                },
                                description: {
                                    type: FORM_OPTIONS.TEXT,
                                    title: "Description",
                                    placeholder: "A collection of awesome elements",
                                },
                                // author: {
                                //     type: FORM_OPTIONS.TEXT,
                                //     title: "Author",
                                //     placeholder: "John Doe",
                                // },
                                selectedItems: {
                                    type: FORM_OPTIONS.CUSTOM,
                                    title: (
                                        <span className="inline-flex gap-2 items-center">
                                            <span>Items to include in the library.</span>
                                            <span className="font-bold hover:underline cursor-pointer" onClick={handleSelectAll}>
                                                {data.selectedItems.size < personalLibraryItems.length ? "Select all" : "Unselect all"}
                                            </span>
                                        </span>
                                    ),
                                    render: ({value, onChange}) => (
                                        <LibraryItemsGrid
                                            items={personalLibraryItems}
                                            selectedItems={value}
                                            onChange={onChange}
                                        />
                                    ),
                                },
                            }}
                            onChange={setData}
                        />
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button variant="secondary" onClick={props.onCancel}>
                            <span>Cancel</span>
                        </Button>
                        <Button variant="primary" disabled={!isSubmitEnabled} onClick={handleSubmit}>
                            <span>Export Library</span>
                        </Button>
                    </Dialog.Footer>
                </Dialog>
            </Centered>
        </React.Fragment>
    );
};
