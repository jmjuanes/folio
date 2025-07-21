import { jest, expect, describe, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";

jest.unstable_mockModule("../use-api-client.ts", () => ({
    useApiClient: jest.fn(() => {
        return jest.fn((method, path, data) => {
            return Promise.resolve({
                data: {
                    method: method,
                    path: path,
                    data,
                },
            });
        });
    }),
}));

const { useGraphqlClient } = await import("../use-graphql-client.ts");

describe("useGraphqlClient", () => {
    it("should perform a POST to '/_graphql' endpoint", async () => {
        const { result } = renderHook(() => useGraphqlClient("TOKEN"));
        const response = await result.current("QUERY");

        expect(response.data.method).toEqual("POST");
        expect(response.data.path).toEqual("/_graphql");
    });
});
