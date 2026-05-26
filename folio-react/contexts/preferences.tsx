import { createContext, useContext, useMemo } from "react";
import { PREFERENCES } from "../constants.js";
import type { JSX } from "react";

export type Preferences = {
    [key: string]: string | boolean | number | null;
};

export type PreferencesProviderProps = {
    preferences: Preferences | null;
    children: React.ReactNode;
};

// @description default preferences
export const DEFAULT_PREFERENCES = {
    // keyboard shortcuts
    [PREFERENCES.KEYBOARD_SHORTCUTS_ENABLED]: true,
    // minimap preferences
    [PREFERENCES.MINIMAP_ENABLED]: true,
    [PREFERENCES.MINIMAP_SIDE]: "left",
    // layers preferences
    [PREFERENCES.LAYERS_ENABLED]: true,
    // toolbar preferences
    [PREFERENCES.TOOLBAR_ENABLED]: true,
    [PREFERENCES.TOOLBAR_LOCK_TOOL_VISIBLE]: true,
    [PREFERENCES.TOOLBAR_LOCK_TOOL_SIDE]: "right",
    // library preferences
    [PREFERENCES.LIBRARY_ENABLED]: false,
    [PREFERENCES.LIBRARY_EXPORT_ENABLED]: true,
    [PREFERENCES.LIBRARY_EXPORT_COLLECTIONS]: true,
    [PREFERENCES.LIBRARY_EXPORT_COMPONENTS]: true,
    // command palette
    [PREFERENCES.COMMAND_PALETTE_ENABLED]: true,
    [PREFERENCES.COMMAND_PALETTE_SEARCH]: true,
    // ai preferences
    // [PREFERENCES.AI_ENABLED]: false,
};

// @private Shared preferences context
export const UserPreferencesContext = createContext<Preferences | null>(null);

// @description access only to user preferences
export const useUserPreferences = (): Preferences => {
    return useContext(UserPreferencesContext) || {};
};

// @description use preferences hook
// this hook will return 
export const usePreferences = (): Preferences => {
    const userPreferences = useContext(UserPreferencesContext);
    return useMemo(() => {
        return Object.assign({}, DEFAULT_PREFERENCES, userPreferences || {});
    }, [userPreferences]);
};

// @description Preferences provider component
export const PreferencesProvider = (props: PreferencesProviderProps): JSX.Element => {
    const userPreferences = props.preferences;
    return (
        <UserPreferencesContext.Provider value={userPreferences}>
            {props.children}
        </UserPreferencesContext.Provider>
    );
};
