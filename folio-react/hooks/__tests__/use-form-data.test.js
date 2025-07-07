import { expect, describe, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

import { useFormData } from "../use-form-data.js";

describe("useFormData", () => {
    it("should initialize with a default empty object", () => {
        const { result } = renderHook(() => useFormData());
        expect(result.current[0]).toEqual({});
    });

    it("should allow providing an initial data object", () => {
        const initialData = {
            name: "John",
            age: 30,
        };
        const { result } = renderHook(() => useFormData(initialData));
        expect(result.current[0]).toEqual(initialData);
    });

    it("should allow to manipulate a field in the data", async () => {
        const initialData = {
            name: "John",
            age: 30,
        };
        const { result } = renderHook(() => useFormData(initialData));
        const setKeyValue = result.current[1];

        await act(async () => {
            setKeyValue("name", "Jane");
        });

        expect(result.current[0]).toEqual({
            name: "Jane",
            age: 30,
        });
    });

    it("should allow to set the entire data object", async () => {
        const initialData = {
            name: "John",
            age: 30,
        };
        const { result } = renderHook(() => useFormData(initialData));
        const setData = result.current[2];

        const newData = {
            name: "Alice",
            age: 25,
        };

        await act(async () => {
            setData(newData);
        });

        expect(result.current[0]).toEqual(newData);
    });
});
