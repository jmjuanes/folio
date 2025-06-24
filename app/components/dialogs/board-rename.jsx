import React from "react";
import {Button} from "folio-react/components/ui/button.jsx";
import {Dialog} from "folio-react/components/ui/dialog.jsx";
import {Form} from "folio-react/components/form/index.jsx";
import {FORM_OPTIONS} from "folio-react/constants.js";
import {useFormData} from "folio-react/hooks/use-form-data.js";
import {useClient} from "../../contexts/client.jsx";

const boardFields = {
    name: {
        type: FORM_OPTIONS.TEXT,
        title: "Board Name",
        placeholder: "Untitled Board",
        helper: "Give your board a name.",
    },
    // description: {
    //     type: FORM_OPTIONS.TEXTAREA,
    //     title: "Description",
    //     // placeholder: "Add a description",
    //     helper: "Add a description to your page.",
    // },
    // readonly: {
    //     type: FORM_OPTIONS.CHECKBOX,
    //     title: "Read Only",
    //     helper: "Make this board read only.",
    // },
};

// @description component to rename a board
export const BoardRenameDialog = props => {
    const client = useClient();
    const [data, setData, resetData] = useFormData({});
    const isSubmitEnabled = !!data.name;

    // handle submit update board metadata
    const handleSubmit = React.useCallback(() => {
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
    }, [props.id, client, data]);

    // on load, import the board metadata and update the data object
    React.useEffect(() => {
        client.getBoard(props.id).then(board => {
            return resetData(board);
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
