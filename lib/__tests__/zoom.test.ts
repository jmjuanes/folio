import { getTranslateCoordinatesForNewZoom } from "../zoom.ts";

describe("getTranslateCoordinatesForNewZoom", () => {
    it("should correctly zoom in from 1 to 2 when translation is zero", () => {
        const result = getTranslateCoordinatesForNewZoom(2, 500, 500, {
            zoom: 1,
            translateX: 0,
            translateY: 0,
        });
        expect(result.zoom).toBe(2);
        expect(result.translateX).toBe(-250);
        expect(result.translateY).toBe(-250);
    });

    it("should correctly zoom out from 2 to 1 when translation is centered", () => {
        const result = getTranslateCoordinatesForNewZoom(1, 500, 500, {
            zoom: 2,
            translateX: -250,
            translateY: -250,
        });
        expect(result.zoom).toBe(1);
        expect(result.translateX).toBe(0);
        expect(result.translateY).toBe(0);
    });

    it("should correctly calculate translation relative to the viewport center when panned (user's scenario)", () => {
        // User's scenario: viewport is 500x500, top-left is (600, 300) -> translateX = -600, translateY = -300
        // Zooming in from 1 to 2 should keep board center (850, 550) at the center of the viewport (250, 250)
        const resultZoomIn = getTranslateCoordinatesForNewZoom(2, 500, 500, {
            zoom: 1,
            translateX: -600,
            translateY: -300,
        });
        expect(resultZoomIn.zoom).toBe(2);
        expect(resultZoomIn.translateX).toBe(-1450);
        expect(resultZoomIn.translateY).toBe(-850);

        // Zooming out from 2 back to 1 from the new state should return to the original translation
        const resultZoomOut = getTranslateCoordinatesForNewZoom(1, 500, 500, {
            zoom: 2,
            translateX: -1450,
            translateY: -850,
        });
        expect(resultZoomOut.zoom).toBe(1);
        expect(resultZoomOut.translateX).toBe(-600);
        expect(resultZoomOut.translateY).toBe(-300);
    });
});
