import React from "react";
import {Button} from "../ui/button.jsx";
import {Centered} from "../ui/centered.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Overlay} from "../ui/overlay.jsx";
import {Form} from "../form/index.jsx";
import {FORM_OPTIONS} from "../../constants.js";
import {useFormData} from "../../hooks/use-form-data.js";
import {useScene} from "../../contexts/scene.jsx";
import {getLibraryItemThumbnail} from "../../library.js";

// Tiny hook to generate the thumbnail for the library item
const useLibraryItemThumbnail = (elements, scale = 1) => {
    const [thumbnail, setThumbnail] = React.useState(null);
    React.useEffect(() => {
        getLibraryItemThumbnail(elements, scale).then(setThumbnail);
    }, [elements]);
    return thumbnail;
};

// @description Display a dialog for adding a new element into the library
export const LibraryAddDialog = props => {
    const scene = useScene();
    const [data, setData] = useFormData({});
    const selectedElements = scene.getSelection();
    const thumbnail = useLibraryItemThumbnail(selectedElements, 2);
    const handleSubmit = () => {
        return props.onAdd(selectedElements, data);
    };
    return (
        <React.Fragment>
            <Overlay className="z-50" />
            <Centered className="fixed z-50 h-full">
                <Dialog className="max-w-lg relative">
                    <Dialog.Close onClick={props.onCancel} />
                    <Dialog.Header className="mb-4">
                        <Dialog.Title>Add to Library</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <div className="flex gap-4 w-full mb-8">
                            <div className="w-32 shrink-0">
                                {thumbnail && (
                                    <div className="rounded-lg border border-neutral-200 overflow-hidden">
                                        <img src={thumbnail} width="100%" height="100%" />
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <Form
                                    data={data}
                                    items={{
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
                                    }}
                                    onChange={setData}
                                />
                            </div>
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button variant="secondary" onClick={props.onCancel}>
                            <span>Cancel</span>
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            <span>Add to Library</span>
                        </Button>
                    </Dialog.Footer>
                </Dialog>
            </Centered>
        </React.Fragment>
    );
};
