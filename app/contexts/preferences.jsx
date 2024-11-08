import React from "react";
import {useMount} from "react-use";
import {PREFERENCES_FIELDS} from "../constants.js";
import {promisifyValue} from "../utils/promises.js";
import {Loading} from "../components/loading.jsx";

// default preferences object
const DEFAULT_PREFERENCES = {
    [PREFERENCES_FIELDS.PAGES_GALLERY_MODE]: false,
};

// internal context for user preferences
export const PreferencesContext = React.createContext();

// use preferences hook
export const usePreferences = () => {
    return React.useContext(PreferencesContext);
};

// user preferences provider
export const PreferencesProvider = props => {
    const [preferences, setPreferences] = React.useState(null);
    // TODO: we would need to handle errors when importing scene data
    useMount(() => {
        promisifyValue(props.initialData).then(value => {
            return setPreferences({...DEFAULT_PREFERENCES, ...(value || {})});
        });
    });
    // Internal method to update preferences
    const updatePreferences = React.useCallback((key, value) => {
        setPreferences(prevPreferences => {
            return {...prevPreferences, [key]: value};
        });
    }, [setPreferences]);
    // call the onChangePreferences method when preferences change
    React.useEffect(() => {
        if (preferences && typeof props.onChange === "function") {
            props.onChange(preferences);
        }
    }, [preferences]);
    // If preferences is not available (yet), do not render
    if (!preferences) {
        return <Loading />;
    }
    return (
        <PreferencesContext.Provider value={[preferences, updatePreferences]}>
            {props.children}
        </PreferencesContext.Provider>
    );
};
