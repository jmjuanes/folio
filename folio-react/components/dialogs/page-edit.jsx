import React from "react";
import {Button} from "../ui/button.jsx";
import {Dialog} from "../ui/dialog.jsx";
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

// @description component to edit pages properties
// @param {object} props React props
// @param {object} props.page page object
// @param {function} props.onClose close dialog callback
export const PageEditDialog = props => {
    const editor = useEditor();
    const page = editor.getPage(props.page.id);

    const [data, setData] = useFormData({
        title: page.title,
        description: page.description,
        readonly: !!page.readonly,
    });

    // handle submit --> save page properties
    const handleSubmit = React.useCallback(data => {
        // currently the only way to update page properties is using object.assign to the page object
        Object.assign(page, data);
        editor.dispatchChange();
        editor.update();
        props.onClose();
    }, [editor, editor.page.id, props.page.id]);

    const isSubmitEnabled = !!data.title;
    return (
        <React.Fragment>
            <Dialog.Header>
                <Dialog.Title>Edit Page</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
                <Form
                    data={data}
                    items={pageEditFields}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant="secondary" onClick={props.onClose}>
                    <span>Cancel</span>
                </Button>
                <Button variant="primary" disabled={!isSubmitEnabled} onClick={() => handleSubmit(data)}>
                    <span>Save Changes</span>
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};
