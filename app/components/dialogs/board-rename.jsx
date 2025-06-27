import React from "react";
import { Button } from "folio-react/components/ui/button.jsx";
import { Dialog } from "folio-react/components/ui/dialog.jsx";
import { Form } from "folio-react/components/form/index.jsx";
import { FORM_OPTIONS } from "folio-react/constants.js";
import { useFormData } from "folio-react/hooks/use-form-data.js";
import { useClient } from "../../contexts/client.jsx";
import { getPropertyByKey, createProperty } from "../../utils/properties.js";

const boardFields = {
    title: {
        type: FORM_OPTIONS.TEXT,
        title: "Board Name",
        placeholder: "Untitled Board",
        helper: "Give your board a name.",
    },
};

// @description component to rename a board
export const BoardRenameDialog = props => {
    const client = useClient();
    const [titleProperty, setTitleProperty] = React.useState(null);
    const [data, setData, resetData] = useFormData({});
    const isSubmitEnabled = !!data.title;

    // handle submit update board metadata
    const handleSubmit = React.useCallback(() => {
        let request = null;
        if (titleProperty) {
            request = client.updateProperty(titleProperty.id, createProperty("title", data.title));
        }
        else {
            // we have to create a new property assigned to this board
            request = client.addBoardProperty(props.id, createProperty("title", data.title));
        }
        return client.updateBoard(props.id, data).then(() => {
            // if onSubmit callback is provided, call it with the updated data
            // this is useful to update the board list in the parent component
            // or to perform any other action after the board is renamed
            if (typeof props.onSubmit === "function") {
                props.onSubmit(data);
            }
            // anyway, close the dialog
            props.onClose();
        });
    }, [props.id, client, data, titleProperty]);

    // on load, import the board properties and find the one containing
    // the board title
    React.useEffect(() => {
        client.getBoardProperties(props.id).then(allProperties => {
            const property = getPropertyByKey(allProperties, "title");
            if (property) {
                setTitleProperty(property);
            }
            resetData({
                title: property?.content?.value || "Untitled",
            });
        });
    }, [props.id, client]);

    return (
        <React.Fragment>
            <Dialog.Header>
                <Dialog.Title>Rename Board</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
                <Form
                    data={data}
                    items={boardFields}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant="secondary" onClick={props.onClose}>
                    <span>Cancel</span>
                </Button>
                <Button variant="primary" disabled={!isSubmitEnabled} onClick={handleSubmit}>
                    <span>Save</span>
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};
