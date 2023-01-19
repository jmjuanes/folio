import React from "react";

export const useDebounce = (value, delay, callback) => {
    React.useEffect(() => {
        // Set debouncedValue to value (passed in) after the specified delay
        const handler = setTimeout(() => {
            console.log("UPDATE_BOARD");
            callback();
        }, delay);

        // If effect is caller again, first clear handler
        return () => clearTimeout(handler);
    }, [value]);
};
