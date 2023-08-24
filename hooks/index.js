import React from "react";

export * from "./useBounds.js";
export * from "./useCursor.js";
export * from "./useEvents.js";
export * from "./useHandlers.js";

// Delay the execution of the provided function when the component is mounted
export const useDelay = (ms, callback) => {
    React.useEffect(() => {
        setTimeout(callback, ms);
    }, []);
};

// Debounce the execution of the provided function
export const useDebounce = (ms, callback) => {
    const timer = React.useRef(null);
    return (args) => {
        // First check to clear the current timeout
        if (timer.current !== null) {
            clearTimeout(timer.current);
        }
        // Register the new timeout
        timer.current = setTimeout(() => callback(args), ms);
    };
};

// Force an update hook
export const useForceUpdate = () => {
    return React.useReducer(x => x + 1, 0);
};
