import {
    normalizeBounds,
    getRectangleBounds,
} from "./math.js";

describe("normalizeBounds", () => {
    it("should return normalized bounds", () => {
        const originalBound = {x1: 10, x2: 0, y1: 0, y2: 10};
        const newBounds = normalizeBounds(originalBound);

        expect(newBounds.x1).toEqual(originalBound.x2);
        expect(newBounds.x2).toEqual(originalBound.x1);
        expect(newBounds.y1).toEqual(originalBound.y1);
        expect(newBounds.y2).toEqual(originalBound.y2);
    });
});

describe("getRectangleBounds", () => {
    it("should generate the bounds", () => {
        const originalBounds = [
            {x1: 10, y1: 10, x2: 15, y2: 15},
            {x1: 12, y1: 5, x2: 5, y2: 20},
        ];
        const newBounds = getRectangleBounds(originalBounds);

        expect(newBounds.x1).toEqual(5);
        expect(newBounds.x2).toEqual(15);
        expect(newBounds.y1).toEqual(5);
        expect(newBounds.y2).toEqual(20);
    });
});
