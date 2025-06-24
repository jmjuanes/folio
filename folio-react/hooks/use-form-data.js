import React from "react";

// @description allows to create and manage form data
export const useFormData = (initialData = {}) => {
    const [data, setData] = React.useState(initialData);

    // method to update a single field in the form data
    const setKeyValue = React.useCallback((key, value) => {
        return setData(prevData => {
            return Object.assign({}, prevData, {
                [key]: value,
            });
        });
    }, [setData]);

    // return the data, the setKeyValue method, and the setData method
    return [data, setKeyValue, setData];
};
