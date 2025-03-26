import React from "react";
import {Button} from "../ui/button.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Form} from "../form/index.jsx";
import {FORM_OPTIONS} from "../../constants.js";
import {useFormData} from "../../hooks/use-form-data.js";
import {useEditor} from "../../contexts/editor.jsx";
import {useDialog} from "../../contexts/dialogs.jsx";
import {getLibraryItemThumbnail} from "../../lib/library.js";

// Tiny hook to generate the thumbnail for the library item
const useLibraryItemThumbnail = (elements, scale = 1) => {
    const [thumbnail, setThumbnail] = React.useState(null);
    React.useEffect(() => {
        getLibraryItemThumbnail(elements, scale).then(setThumbnail);
    }, [elements]);
    return thumbnail;
};

// library add fields
const libraryAddFields = {
    name: {
        type: FORM_OPTIONS.TEXT,
        title: "Name",
        placeholder: "My Awesome Element",
    },
    description: {
        type: FORM_OPTIONS.TEXT,
        title: "Description",
        placeholder: "A description of the element",
    },
};

// @description Display a dialog for adding a new element into the library
export const LibraryAddDialog = () => {
    const editor = useEditor();
    const [data, setData] = useFormData({});
    const {hideDialog} = useDialog();
    const selectedElements = editor.getSelection();
    const thumbnail = useLibraryItemThumbnail(selectedElements, 3);

    // handle submit --> save the selected elments as a new library item 
    const handleSubmit = React.useCallback(() => {
        editor.addLibraryItem(selectedElements, data).then(() => {
            editor.dispatchLibraryChange();
            editor.update();
            hideDialog();
        });
    }, [editor, data, selectedElements.length]);

    return (
        <React.Fragment>
            <Dialog.Header>
                <Dialog.Title>Add to Library</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col gap-2 w-full mb-8">
                <div className="h-40 flex items-center justify-center rounded-lg border border-neutral-200">
                    {thumbnail && (
                        <img src={thumbnail} height="100%" />
                    )}
                </div>
                <Form
                    data={data}
                    items={libraryAddFields}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant="secondary" onClick={() => hideDialog()}>
                    <span>Cancel</span>
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    <span>Add to Library</span>
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};
