import React from "react";
import {getItem, setItem} from "@lib/utils/storage.js";

// Export local storage hook
export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = React.useState(() => {
        return getItem(key, defaultValue) ?? defaultValue;
    });

    // Automatically save value when it changes 
    React.useEffect(() => {
        const timer = setTimeout(() => setItem(key, value),250);
        return () => {
            clearTimeout(timer);
        };
    }, [value]);

    // Return getter and setter for current value
    return [value, setValue];
};
