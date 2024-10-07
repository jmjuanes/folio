import React from "react";
import {
    FORM_OPTIONS,
} from "../../constants.js";
import {BACKGROUND_COLOR_PALETTE} from "../../utils/colors.js";
import {Panel} from "../ui/panel.jsx";
import {Form} from "../form/index.jsx";
import {useScene} from "../../contexts/scene.jsx";

// settings fields
const FIELDS = {
    GRID: "appState.grid",
    SNAP_TO_ELEMENTS: "appState.snapToElements",
    OBJECT_DIMENSIONS: "appState.objectDimensions",
    BACKGROUND: "background",
};

// sectons
const sections = {
    [FIELDS.GRID]: {
        title: "Show Grid",
        type: FORM_OPTIONS.CHECKBOX,
    },
    "SEPARATOR_0": {
        type: "separator",
    },
    [FIELDS.SNAP_TO_ELEMENTS]: {
        title: "Snap to Elements",
        type: FORM_OPTIONS.CHECKBOX,
        helper: "Show guides to easily align elements.",
    },
    [FIELDS.OBJECT_DIMENSIONS]: {
        title: "Show Object Dimensions",
        type: FORM_OPTIONS.CHECKBOX,
        helper: "Show dimensions of selection.",
    },
    "SEPARATOR_1": {
        type: "separator",
    },
    [FIELDS.BACKGROUND]: {
        title: "Board Background",
        type: FORM_OPTIONS.COLOR,
        values: BACKGROUND_COLOR_PALETTE,
    },
};

const getValue = (obj, path) => {
    return path.split(".").reduce((o, key) => o[key], obj);
};

const setValue = (obj, path, value) => {
    let i = 0;
    const pathItems = path.split(".");
    for (i = 0; i < pathItems.length - 1; i++) {
        obj = obj[pathItems[i]];
    }
    obj[pathItems[i]] = value;
};

export const SettingsPanel = props => {
    const scene = useScene();
    const values = Object.fromEntries(Object.values(FIELDS).map(key => {
        return [key, getValue(scene, key)];
    }));
    const handleChange = (key, value) => {
        setValue(scene, key, value);
        props.onChange();
    };

    return (
        <Panel className="w-60">
            <Panel.Header>
                <Panel.HeaderTitle>Settings</Panel.HeaderTitle>
            </Panel.Header>
            <Panel.Body className="">
                <Form
                    className="flex flex-col gap-2"
                    data={values}
                    items={sections}
                    onChange={handleChange}
                />
            </Panel.Body>
        </Panel>
    );
};
