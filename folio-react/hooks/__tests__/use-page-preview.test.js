import { jest, expect, describe, it } from "@jest/globals";
import { renderHook, waitFor} from "@testing-library/react";

const BASE_64_DATA = "data:image/png;base64,aaaa";

jest.unstable_mockModule("../../contexts/editor.jsx", () => ({
    useEditor: jest.fn(() => ({
        assets: {},
        background: "#fff",
        page: {
            id: "page1",
        },
        updatedAt: "12345",
    })),
}));

jest.unstable_mockModule("../../lib/export.js", () => ({
    exportToDataURL: jest.fn().mockResolvedValue(BASE_64_DATA),
}));

const { usePagePreview } = await import("../use-page-preview.js");

describe("usePagePreview", () => {
    it("should return the result of calling 'exportToDataURL'", async () => {
        const { result } = renderHook(() => {
            return usePagePreview({ id: "page1", elements: [] }, 140, 80);
        });

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        expect(result.current).toBe(BASE_64_DATA);
    });
});
