import { jest, expect, describe, it } from "@jest/globals";

jest.unstable_mockModule("../../utils/blob.js", () => ({
    blobToDataUrl: jest.fn(b => {
        return jest.fn().mockResolvedValue("BLOB_" + b);
    }),
}));

globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue("@font-face { font-family: 'Roboto'; src: url('https://example.com/roboto.woff2'); }"),
    blob: jest.fn().mockResolvedValue("FILE_BLOB"),
});

const { getFontsCss } = await import("../fonts.js");

describe("getFontsCss", () => {
    it("should return css with @import for external fonts when 'embed' option is set to false", async () => {
        const fonts = [
            "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
            "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap",
        ];
        const css = await getFontsCss(fonts, false);
        expect(css).toContain("@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');");
        expect(css).toContain("@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');");
    });

    it("should return css with embedded font data when 'embed' option is set to true", async () => {
        const fonts = [
            "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
            "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap",
        ];
        const css = await getFontsCss(fonts, true);
        expect(css).toContain("font-family: 'Roboto'");
    });
});
