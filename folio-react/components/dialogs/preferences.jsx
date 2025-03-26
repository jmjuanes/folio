import React from "react";
import {PREFERENCES_FIELDS, FORM_OPTIONS} from "../../constants.js";
import {Button} from "../ui/button.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Form} from "../form/index.jsx";
import {useEditor} from "../../contexts/editor.jsx";
import {useDialog} from "../../contexts/dialogs.jsx";
import {useFormData} from "../../hooks/use-form-data.js";

// @description default preferences dialog content
export const PreferencesDialog = () => {
    const editor = useEditor();
    const {hideDialog} = useDialog();
    const [data, setData] = useFormData(editor.preferences || {});
    const preferencesFields = React.useMemo(() => {
        return {
            [PREFERENCES_FIELDS.MINIMAP_VISIBLE]: {
                type: FORM_OPTIONS.CHECKBOX,
                title: "Show Minimap",
                helper: "Show or hide a minimap in the bottom left corner of the board.",
            },
        };
    }, [data]);

    // handle submit --> save the preferences in the editor object and
    // dispatch a change event
    const handleSubmit = React.useCallback(() => {
        // merge preferences with the editor preferences
        Object.assign(editor.preferences, data);
        editor.dispatchPreferencesChange();
        editor.update(); // force to update the editor
        hideDialog();
    }, [data]);

    return (
        <React.Fragment>
            <Dialog.Header>
                <Dialog.Title>Preferences</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className="mb-8">
                <Form
                    data={data}
                    items={preferencesFields}
                    onChange={setData}
                />
            </Dialog.Body>
            <Dialog.Footer className="">
                <Button variant="secondary" onClick={hideDialog}>
                    <span>Cancel</span>
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    <span>Save Preferences</span>
                </Button>
            </Dialog.Footer>
        </React.Fragment>
    );
};
