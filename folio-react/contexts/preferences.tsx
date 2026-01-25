import React from "react";
import {
    PREFERENCES,
    MINIMAP_POSITION,
} from "../constants.js";

export type Preferences = {
    [key: string]: string | boolean | number | null;
};

export type PreferencesProviderProps = {
    preferences: Preferences | null;
};

// @description default preferences
export const DEFAULT_PREFERENCES = {
    [PREFERENCES.EDITOR_MINIMAP_ENABLED]: true,
    [PREFERENCES.EDITOR_MINIMAP_SCALE]: 1,
    [PREFERENCES.EDITOR_MINIMAP_POSITION]: MINIMAP_POSITION.BOTTOM_LEFT,
};

// @private Shared preferences context
export const PreferencesContext = React.createContext<Preferences>({});

// @description use preferences hook
export const usePreferences = (): Preferences => {
    return React.useContext(PreferencesContext);
};

// @description Preferences provider component
export const PreferencesProvider = (props: PreferencesProviderProps): React.JSX.Element => {
    const preferences = Object.assign({}, DEFAULT_PREFERENCES, props.preferences || {});
    return (
        <PreferencesContext.Provider value={preferences}>
            {props.children}
        </PreferencesContext.Provider>
    );
};
