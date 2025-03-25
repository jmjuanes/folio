import React from "react";
import {FORM_OPTIONS} from "../../constants.js";
import {BACKGROUND_COLOR_PALETTE} from "../../utils/colors.js";
import {Dropdown} from "../ui/dropdown.jsx";
import {Island} from "../ui/island.jsx";
import {Form} from "../form/index.jsx";
import {useEditor} from "../../contexts/editor.jsx";

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
        title: "Background",
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

// @description settings menu
export const SettingsMenu = () => {
    const editor = useEditor();

    // get values from the editor configuration
    const values = Object.fromEntries(Object.values(FIELDS).map(key => {
        return [key, getValue(editor, key)];
    }));

    // perform a change in the editor configuration
    const handleChange = React.useCallback((key, value) => {
        setValue(editor, key, value);
        editor.dispatchChange();
        editor.update();
    }, []);

    return (
        <div className="flex relative group" tabIndex="0">
            <Island.Button icon="sliders" />
            <Dropdown className="hidden group-focus-within:block top-full left-0 mt-2 w-60 z-40">
                <Form
                    className="flex flex-col gap-2 p-1"
                    data={values}
                    items={sections}
                    onChange={handleChange}
                />
            </Dropdown>
        </div>
    );
};
