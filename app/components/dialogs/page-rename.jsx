import React from "react";
import {Button} from "../ui/button.jsx";
import {Centered} from "../ui/centered.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Overlay} from "../ui/overlay.jsx";
import {Form} from "../form/index.jsx";
import {FORM_OPTIONS} from "../../constants.js";
import {useFormData} from "../../hooks/use-form-data.js";

// @private list of form fields
const pageEditFields = {
    title: {
        type: FORM_OPTIONS.TEXT,
        placeholder: "Untitled Page",
    },
};

// @public component to edit the page title
export const PageRenameDialog = ({title, onSubmit, onCancel}) => {
    const [data, setData] = useFormData({
        title: title,
    });
    const submitDisabled = !data.title || data.title === title;
    const handleSubmit = () => {
        return onSubmit(data.title);
    };
    return (
        <React.Fragment>
            <Overlay className="z-50" />
            <Centered className="fixed z-50 h-full">
                <Dialog className="max-w-md relative">
                    <Dialog.Close onClick={onCancel} />
                    <Dialog.Header>
                        <Dialog.Title>Rename Page</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Form
                            data={data}
                            items={pageEditFields}
                            onChange={setData}
                        />
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button variant="secondary" onClick={onCancel}>
                            <span>Cancel</span>
                        </Button>
                        <Button variant="primary" disabled={submitDisabled} onClick={handleSubmit}>
                            <span>Rename</span>
                        </Button>
                    </Dialog.Footer>
                </Dialog>
            </Centered>
        </React.Fragment>
    );
};
