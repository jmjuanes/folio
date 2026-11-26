import { useCallback } from "react";
import { FORM_OPTIONS } from "../constants.ts";
import { BACKGROUND_COLOR_PALETTE } from "../lib/utils/colors.ts";
import { Dropdown } from "./ui/dropdown.tsx";
import { Island } from "./ui/island.tsx";
import { Form } from "./form/index.jsx";
import { useEditor } from "../contexts/editor.tsx";
import type { ReactNode, JSX } from "react";

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

const getValue = (obj: any, path: string) => {
    return path.split(".").reduce((o, key) => o[key], obj);
};

const setValue = (obj: any = {}, path: string, value: any) => {
    let i = 0;
    const pathItems = path.split(".");
    for (i = 0; i < pathItems.length - 1; i++) {
        obj = obj[pathItems[i]];
    }
    obj[pathItems[i]] = value;
};

// @description settings menu content
export const SettingsContent = () => {
    const editor = useEditor();

    // get values from the editor configuration
    const values = Object.fromEntries(Object.values(FIELDS).map(key => {
        return [key, getValue(editor, key)];
    }));

    // perform a change in the editor configuration
    const handleChange = useCallback((key: string, value: any) => {
        setValue(editor, key, value);
        editor.dispatchChange();
        editor.update();
    }, []);

    return (
        <Form
            className="flex flex-col gap-2 p-1"
            data={values}
            items={sections}
            onChange={handleChange}
        />
    );
};

export type SettingsProps = {
    children: ReactNode;
};

// @description settings menu
export const Settings = (props: SettingsProps): JSX.Element => {
    // use the default content if no children are provided
    const content = props.children ?? <SettingsContent />;

    return (
        <div className="flex items-center justify-center w-16 h-full select-none">
            <Dropdown.Portal
                id="settings:options"
                position="bottom-left"
                toggleClassName="flex items-center"
                contentClassName="absolute z-50 mt-2 w-60"
                toggleRender={(active) => (
                    <Island.Button active={active} icon="sliders" />
                )}
                contentRender={() => (
                    <Dropdown className="w-full">
                        {content}
                    </Dropdown>
                )}
            />
        </div>
    );
};
