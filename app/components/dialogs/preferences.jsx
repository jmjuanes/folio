import React from "react";
import {PREFERENCES_FIELDS, FORM_OPTIONS} from "../../constants.js";
import {Button} from "../ui/button.jsx";
import {Centered} from "../ui/centered.jsx";
import {Dialog} from "../ui/dialog.jsx";
import {Overlay} from "../ui/overlay.jsx";
import {Form} from "../form/index.jsx";
import {usePreferences} from "../../contexts/preferences.jsx";
import {useFormData} from "../../hooks/use-form-data.js";

const preferencesFields = {
    [PREFERENCES_FIELDS.MINIMAP_VISIBLE]: {
        type: FORM_OPTIONS.CHECKBOX,
        title: "Show Minimap",
        helper: "Show or hide a minimap in the bottom left corner of the board.",
    },
};

export const PreferencesDialog = props => {
    const [preferences] = usePreferences();
    const [data, setData] = useFormData(preferences);
    const handleSubmit = () => {
        return props.onSubmit(data);
    };
    return (
        <React.Fragment>
            <Overlay className="z-50" />
            <Centered className="fixed z-50 h-full">
                <Dialog className="max-w-sm relative">
                    <Dialog.Close onClick={props.onCancel} />
                    <Dialog.Header className="mb-4">
                        <Dialog.Title>Preferences</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <div className="mb-8">
                            <Form
                                data={data}
                                items={preferencesFields}
                                onChange={setData}
                            />
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button variant="secondary" onClick={props.onCancel}>
                            <span>Cancel</span>
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            <span>Save Preferences</span>
                        </Button>
                    </Dialog.Footer>
                </Dialog>
            </Centered>
        </React.Fragment>
    );
};
