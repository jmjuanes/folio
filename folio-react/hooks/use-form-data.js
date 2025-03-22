import React from "react";

// @private internal form data reducer method
const formDataReducer = (state, action) => {
    return Object.assign({}, state, {
        [action.key]: action.value,
    });
};

// @description allows to create and manage form data
export const useFormData = initialData => {
    const [data, dataDispatcher] = React.useReducer(formDataReducer, initialData);
    const dispatcher = React.useCallback((key, value) => {
        dataDispatcher({key, value});
    }, []);
    return [data, dispatcher];
};
