import React from "react";
import {FORM_OPTIONS} from "folio-react/constants.js";
import {Button} from "folio-react/components/ui/button.jsx";
import {Dialog} from "folio-react/components/ui/dialog.jsx";
import {Form} from "folio-react/components/form/index.jsx";
import {useDialog} from "folio-react/contexts/dialogs.jsx";
import {useFormData} from "folio-react/hooks/use-form-data.js";
import {useBoards} from "../contexts/boards.jsx";
import {useClient} from "../contexts/client.jsx";

// @description edit board component
export const EditBoard = props => {
    const [boards, actions] = useBoards();
    // const client = useClient();
    const {hideDialog} = useDialog();
    const [data, setData] = useFormData({});

    // board fields definition
    const boardFields = React.useMemo(() => {
        return {
            name: {
                type: FORM_OPTIONS.TEXT,
                title: "Board Name",
                helper: "The name of the board.",
                required: true,
            },
            description: {
                type: FORM_OPTIONS.TEXTAREA,
                title: "Description",
                helper: "A brief description of the board.",
            },
        };
    }, []);

    // handle submit --> update the board metadata
    const handleSubmit = React.useCallback(() => {
        return null;
    }, []);

    // on load component, import the board data
    // React.useEffect(() => {
    //     client.getBoard(props.id).then(boardData => {
    //         setData(boardData);
    //     });
    // }, []);

    return (
        <React.Fragment>
            <Dialog.Header>
                <Dialog.Title>Edit Board</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className="">
                <Form
                    data={data}
                    items={boardFields}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer className="">
                <Button variant="secondary" onClick={hideDialog}>
                    <span>Cancel</span>
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    <span>Save</span>
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};
