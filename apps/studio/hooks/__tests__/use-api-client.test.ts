import { jest, expect, describe, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";

globalThis.fetch = jest.fn((url: string, options: any) => {
    return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue({
            url: url,
            options: options,
        }),
    });
});

const { useApiClient } = await import("../use-api-client.ts");

describe("useApiClient", () => {
    it("should return a method to call the provided endpoint", async () => {
        const { result } = renderHook(() => {
            return useApiClient("TOKEN");
        });

        expect(typeof result.current).toEqual("function");
    });

    it("should not include data if method is GET", async () => {
        const { result } = renderHook(() => {
            return useApiClient("TOKEN");
        });

        const response = await result.current("GET", "URL", { key: true });

        expect(response.options.method).toEqual("GET");
        expect(typeof response.options.body).toEqual("undefined");
    });

    it("should include data only when method is POST, PATCH, DELETE, or PUT", async () => {
        const methods = ["POST", "PUT", "DELETE", "PATCH"];
        const { result } = renderHook(() => {
            return useApiClient("TOKEN");
        });

        for (let i = 0; i < methods.length; i++) {
            const response = await result.current(methods[i], "URL", { key: true });

            expect(response.options.method).toEqual(methods[i]);
            expect(typeof response.options.body).toEqual("string");
        }
    });
});
