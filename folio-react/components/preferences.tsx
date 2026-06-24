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
    const [preferences, setPreferences] = useState({});
    const computedPreferences = useMemo(() => {
        return Object.assign({}, DEFAULT_PREFERENCES, userPreferences, preferences);
    }, [userPreferences, preferences]);
    const preferencesGroups = useMemo(() => {
        const disabledFields = new Set(props.disabledFields || []);
        const allPreferencesGroups = [
            {
                title: "Minimap",
                fields: {
                    [PREFERENCES.MINIMAP_ENABLED]: {
                        type: FORM_OPTIONS.CHECKBOX,
                        disabled: disabledFields.has(PREFERENCES.MINIMAP_ENABLED),
                        title: "Enable Minimap",
                        helper: "Display a Minimap with the current page distribution.",
                    },
                    [PREFERENCES.MINIMAP_SIDE]: {
                        type: FORM_OPTIONS.DROPDOWN_SELECT,
                        disabled: true, // !computedPreferences[PREFERENCES.MINIMAP_ENABLED],
                        title: "Minimap position",
                        values: [
                            { text: "Left Side", value: "left" },
                            { text: "Right Side", value: "right" },
                        ],
                        allowToRemove: false,
                        helper: "Change the position of the minimap in the editor.",
                    },
                },
            },
            {
                title: "Layers",
                fields: {
                    [PREFERENCES.LAYERS_ENABLED]: {
                        type: FORM_OPTIONS.CHECKBOX,
                        disabled: disabledFields.has(PREFERENCES.LAYERS_ENABLED),
                        title: "Enable Layers",
                        helper: "Display the layers structure of the board.",
                    },
                },
            },
            {
                title: "Gestures",
                fields: {
                    [PREFERENCES.GESTURES_WHEEL]: {
                        type: FORM_OPTIONS.CHECKBOX,
                        disabled: disabledFields.has(PREFERENCES.GESTURES_WHEEL),
                        title: "Wheel gestures",
                        helper: "Enable zoom and pan using the mouse wheel.",
                    },
                    [PREFERENCES.GESTURES_PINCH]: {
                        type: FORM_OPTIONS.CHECKBOX,
                        disabled: disabledFields.has(PREFERENCES.GESTURES_PINCH),
                        title: "Pinch gestures",
                        helper: "Enable zoom and pan using two-finger gestures on touch devices.",
                    },
                },
            },
            {
                title: "Context Menu",
                fields: {
                    [PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_ENABLED]: {
                        type: FORM_OPTIONS.CHECKBOX,
                        disabled: disabledFields.has(PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_ENABLED),
                        title: "Export Selection",
                        helper: "Allow to export selected elements from the context menu.",
                    },
                    [PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_INCLUDE_BACKGROUND]: {
                        type: FORM_OPTIONS.CHECKBOX,
                        disabled: (
                            disabledFields.has(PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_INCLUDE_BACKGROUND) ||
                            !computedPreferences[PREFERENCES.CONTEXT_MENU_EXPORT_SELECTION_ENABLED]
                        ),
                        title: "Include background exporting selection",
                        helper: "Include background when exporting selected elements from the context menu.",
                    },
                },
            },
        ];
        // remove hidden fields
        (props.hiddenFields || []).forEach((field: string) => {
            allPreferencesGroups.forEach(group => {
                if (group.fields[field]) {
                    delete group.fields[field];
                }
            });
        });
        // return parsed preferences field
        return allPreferencesGroups.filter(group => Object.keys(group.fields).length > 0);
    }, [props.hiddenFields, props.disabledFields, computedPreferences]);

    // update preferences
    const updatePreferences = useCallback((key: string, value: any) => {
        setPreferences((prevPreferences) => {
            return Object.assign({}, prevPreferences, { [key]: value });
        });
    }, [setPreferences]);

    // when preferences change, dispatch the onChange listener
    // NOTE: this will emit an object containing ONLY the preferences that has been changed
    useEffect(() => {
        if (typeof props.onChange === "function" && Object.keys(preferences).length > 0) {
            props.onChange(preferences);
        }
    }, [preferences]);

    return (
        <div className="flex flex-col gap-6">
            {preferencesGroups.map(group => (
                <div className="flex flex-col gap-2" key={group.title}>
                    <div className="text-base font-bold">{group.title}</div>
                    <Form
                        data={computedPreferences}
                        items={group.fields}
                        onChange={updatePreferences}
                    />
                </div>
            ))}
        </div>
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
            <Centered className="fixed z-50 h-full pointer-events-none">
                <Dialog.Content className="relative w-full max-w-md pointer-events-auto">
                    <Dialog.Close onClick={() => close()} />
                    <Dialog.Header>
                        <Dialog.Title>{props.title || "Preferences"}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body className="h-full overflow-y-scroll max-h-96">
                        {content}
                    </Dialog.Body>
                </Dialog.Content>
            </Centered>
        </Fragment>
    );
};
