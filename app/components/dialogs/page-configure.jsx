import React from "react";
import {Button} from "../ui/button.jsx";
import {Centered} from "../ui/centered.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Overlay} from "../ui/overlay.jsx";
import {Form} from "../form/index.jsx";
import {FORM_OPTIONS} from "../../constants.js";
import {useFormData} from "../../hooks/use-form-data.js";
import {useEditor} from "../../contexts/editor.jsx";

// @private list of form fields
const pageEditFields = {
    title: {
        type: FORM_OPTIONS.TEXT,
        title: "Page Name",
        placeholder: "Untitled Page",
        helper: "Give your page a name.",
    },
    description: {
        type: FORM_OPTIONS.TEXTAREA,
        title: "Description",
        // placeholder: "Add a description",
        helper: "Add a description to your page.",
    },
    readonly: {
        type: FORM_OPTIONS.CHECKBOX,
        title: "Read-Only",
        helper: "Prevent performing changes to the page.",
    },
};

// @public component to customize the page
export const PageConfigureDialog = props => {
    const editor = useEditor();
    const page = editor.getPage(props.page);
    const [data, setData] = useFormData({
        title: page.title,
        description: page.description,
        readonly: !!page.readonly,
    });
    const isSubmitEnabled = !!data.title;
    return (
        <React.Fragment>
            <Overlay className="z-50" />
            <Centered className="fixed z-50 h-full">
                <Dialog className="max-w-md relative">
                    <Dialog.Close onClick={props.onCancel} />
                    <Dialog.Header>
                        <Dialog.Title>Configure Page</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body className="my-6">
                        <Form
                            data={data}
                            items={pageEditFields}
                            onChange={setData}
                        />
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button variant="secondary" onClick={props.onCancel}>
                            <span>Cancel</span>
                        </Button>
                        <Button variant="primary" disabled={!isSubmitEnabled} onClick={() => props.onSubmit(data)}>
                            <span>Save Changes</span>
                        </Button>
                    </Dialog.Footer>
                </Dialog>
            </Centered>
        </React.Fragment>
    );
};
