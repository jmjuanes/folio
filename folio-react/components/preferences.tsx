import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useAlure as useSurface } from "alure";
import { FORM_OPTIONS, PREFERENCES } from "../constants.js";
import { Centered } from "./ui/centered.tsx";
import { Dialog } from "./ui/dialog.tsx";
import { Overlay } from "./ui/overlay.tsx";
import { Form } from "./form/index.jsx";
import { useUserPreferences, DEFAULT_PREFERENCES } from "../contexts/preferences.tsx";
import type { JSX, ReactNode } from "react";

export type PreferencesContentProps = {
    hiddenFields?: string[];
    disabledFields?: string[];
    onChange?: (newPreferences: Record<string, any>) => void;
};

export const PreferencesContent = (props: PreferencesContentProps): JSX.Element => {
    const userPreferences = useUserPreferences();
    const [preferences, setPreferences] = useState(userPreferences);
    const preferencesFields = useMemo(() => {
        const disabledFields = new Set(props.disabledFields || []);
        const allPreferencesFields = {
            [PREFERENCES.MINIMAP_ENABLED]: {
                type: FORM_OPTIONS.CHECKBOX,
                disabled: disabledFields.has(PREFERENCES.MINIMAP_ENABLED),
                title: "Enable Minimap",
                helper: "Display a Minimap with the current page distribution.",
            },
            [PREFERENCES.LAYERS_ENABLED]: {
                type: FORM_OPTIONS.CHECKBOX,
                disabled: disabledFields.has(PREFERENCES.LAYERS_ENABLED),
                title: "Enable Layers",
                helper: "Display the layers structure of the board.",
            },
        };
        // remove hidden fields
        (props.hiddenFields || []).forEach((field: string) => {
            if (allPreferencesFields[field]) {
                delete allPreferencesFields[field];
            }
        });
        // return parsed preferences field
        return allPreferencesFields;
    }, [props.hiddenFields, props.disabledFields]);

    // update preferences
    const updatePreferences = useCallback((key: string, value: any) => {
        setPreferences((prevPreferences) => {
            return Object.assign({}, prevPreferences, { [key]: value });
        });
    }, [setPreferences]);

    // when preferences change, dispatch the onChange listener
    useEffect(() => {
        if (typeof props.onChange === "function") {
            props.onChange(preferences);
        }
    }, [preferences]);

    return (
        <Form
            data={Object.assign({}, DEFAULT_PREFERENCES, preferences)}
            items={preferencesFields}
            onChange={updatePreferences}
        />
    );
};

export type PreferencesProps = {
    title?: string;
    children?: ReactNode;
};

export const Preferences = (props: PreferencesProps): JSX.Element => {
    const { close } = useSurface();
    const content = props.children ?? <PreferencesContent />;
    return (
        <Fragment>
            <Overlay className="z-50" onClick={() => close()} />
            <Centered className="fixed z-50 h-full">
                <Dialog.Content className="relative w-full max-w-md">
                    <Dialog.Close onClick={() => close()} />
                    <Dialog.Header>
                        <Dialog.Title>{props.title || "Preferences"}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body className="">
                        {content}
                    </Dialog.Body>
                </Dialog.Content>
            </Centered>
        </Fragment>
    );
};
