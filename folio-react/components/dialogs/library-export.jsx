import React from "react";
import {CheckIcon} from "@josemi-icons/react";
import {Button} from "../ui/button.jsx";
import {Form} from "../form/index.jsx";
import {FORM_OPTIONS} from "../../constants.js";
import {useFormData} from "../../hooks/use-form-data.js";
import {useDialog} from "../../contexts/dialogs.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {saveLibraryAsJson} from "../../library.js";

// @description library items grid
const LibraryItemsGrid = ({items, selectedItems, onChange}) => {
    const handleItemClick = React.useCallback(itemId => {
        selectedItems.has(itemId) ? selectedItems.delete(itemId) : selectedItems.add(itemId);
        return onChange(selectedItems);
    }, [selectedItems, onChange]);

    return (
        <div className="grid gap-2 grid-cols-8 mb-2 max-h-40 overflow-y-auto">
            {items.map(item => (
                <div key={item.id} onClick={() => handleItemClick(item.id)}>
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
            ))}
        </div>
    );
};

// @description Library export dialog
export const LibraryExportDialog = props => {
    const editor = useEditor();
    const {hideDialog} = useDialog();
    const [data, setData] = useFormData({
        exportAll: true,
        selectedItems: new Set(),
    });

    // to control if the export button should be enabled or not
    const isSubmitEnabled = React.useMemo(() => {
        return editor.library.items.length > 0 && (data.exportAll || data.selectedItems.size > 0) && !!data.name;
    }, [editor, data.exportAll, data.selectedItems.size, data.name]);

    // check if there are selected items to enable the export button
    const handleSubmit = React.useCallback(() => {
        if (isSubmitEnabled) {
            // prepare the library data to export
            const exportLibrary = {
                name: data.name || "",
                description: data.description || "",
                items: editor.library.items.filter(item => data.exportAll || data.selectedItems.has(item.id)),
            };
            saveLibraryAsJson(exportLibrary)
                .then(() => console.log("Library saved"))
                .catch(error => console.error(error))
                .finally(() => hideDialog());
        }
    }, [editor, data, isSubmitEnabled, hideDialog]);

    return (
        <React.Fragment>
            <div className="mb-8">
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
                        exportAll: {
                            type: FORM_OPTIONS.CHECKBOX,
                            title: "Export the entire library",
                            helper: "Disable it to manually select the items of the library to export.",
                        },
                        selectedItems: {
                            type: FORM_OPTIONS.CUSTOM,
                            title: "Items to include",
                            test: currentData => !currentData.exportAll,
                            render: ({value, onChange}) => (
                                <LibraryItemsGrid
                                    items={editor.library.items}
                                    selectedItems={value}
                                    onChange={onChange}
                                />
                            ),
                            helper: `${data.selectedItems.size} selected.`,
                        },
                    }}
                    onChange={setData}
                />
            </div>
            <div className="flex items-center gap-2 justify-end">
                <Button variant="secondary" onClick={() => hideDialog()}>
                    <span>Cancel</span>
                </Button>
                <Button variant="primary" disabled={!isSubmitEnabled} onClick={handleSubmit}>
                    <span>Export Library</span>
                </Button>
            </div>
        </React.Fragment>
    );
};
