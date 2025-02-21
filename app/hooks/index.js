import React from "react";

// @description toggle the provided value from the state
export const useValueToggle = (initialValue = null) => {
    const [value, setValue] = React.useState(initialValue);

    // change the current value or toggle it to 'null'
    const toggle = React.useCallback(newValue => {
        return setValue(prevValue => {
            return newValue !== prevValue ? newValue : null;
        });
    }, []);

    return [value, toggle];
};
