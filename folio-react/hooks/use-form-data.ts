import { useState, useCallback } from "react";

export type FormData = Record<string, any>;
export type SetKeyValue = (key: string, value: any) => void;

// @description allows to create and manage form data
export const useFormData = (initialData: FormData = {}) => {
    const [data, setData] = useState<FormData>(initialData);

    // method to update a single field in the form data
    const setKeyValue = useCallback<SetKeyValue>((key: string, value: any): void => {
        return setData(prevData => {
            return Object.assign({}, prevData, {
                [key]: value,
            });
        });
    }, [setData]);

    // return the data, the setKeyValue method, and the setData method
    return [data, setKeyValue, setData];
};
