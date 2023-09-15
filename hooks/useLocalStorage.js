import React from "react";
import {useDebounce} from "./index.js";

// Get value from local storage
const get = (key, defaultValue) => {
    if (typeof defaultValue === "object") {
        return JSON.parse(localStorage.getItem(key));
    }
    // Just get saved value
    return localStorage.getItem(key);
};

// Set value in local storage
const set = (key, value) => {
    localStorage.setItem(key, typeof value === "object" ? JSON.stringify(value) : value);
};

// Export local storage hook
export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = React.useState(() => {
        return get(key, defaultValue) ?? defaultValue;
    });
    // Automatically save value when it changes 
    useDebounce(250, [value], () => {
        set(key, value);
    });
    // Return getter and setter for current value
    return [value, setValue];
};
