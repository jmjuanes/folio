import React from "react";
import { Button } from "folio-react/components/ui/button.jsx";
import { Dialog } from "folio-react/components/ui/dialog.jsx";
import { Form } from "folio-react/components/form/index.jsx";
import { FORM_OPTIONS } from "folio-react/constants.js";
import { useFormData } from "folio-react/hooks/use-form-data.js";
import { useAppState } from "../../contexts/app-state";
import { useToaster } from "../../contexts/toaster";

const fields = {
    name: {
        type: FORM_OPTIONS.TEXT,
        title: "Document Name",
        helper: "Give your document a name.",
    },
};

// @description component to rename a document
export const RenameDialog = ({ id, onClose }): React.JSX.Element => {
    const { app } = useAppState();
    const toaster = useToaster();
    const [ data, setData, resetData ] = useFormData({});
    const isSubmitEnabled = !!data.name?.trim();

    // handle submit update board metadata
    const handleSubmit = React.useCallback(() => {
        app.updateBoard(id, data)
            .then(() => {
                onClose();
                toaster.success("Document renamed.");
            })
            .catch(error => {
                console.error(error);
                toaster.error(error?.message || "Error renaming board.");
            });
    }, [ id, app, data, originalDocument ]);

    // on mount fetch document details
    React.useEffect(() => {
        app.getBoard(id).then(originalDocument => {
            resetData({
                ...originalDocument?.attributes,
                name: originalDocument?.attributes?.name || "Untitled",
            });
        });
    }, [ id ]);

    return (
        <React.Fragment>
            <Dialog.Header>
                <Dialog.Title>Rename Document</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
                <Form
                    data={data}
                    items={fields}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant="secondary" onClick={onClose}>
                    <span>Cancel</span>
                </Button>
                <Button variant="primary" disabled={!isSubmitEnabled} onClick={handleSubmit}>
                    <span>Save</span>
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};
