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
export const useDebounce = (ms, deps, callback) => {
    React.useEffect(() => {
        const timer = setTimeout(() => callback(), ms);
        return () => {
            clearTimeout(timer);
        };
    }, deps);
};

// Force an update hook
export const useForceUpdate = () => {
    return React.useReducer(x => x + 1, 0);
};
