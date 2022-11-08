import {
    boundaryPoints,
    pointInRectangle,
} from "./index.js";

describe("utils.boundaryPoints", () => {
    it("should generate the boundary rectangle", () => {
        const points = [[1, 2], [0, 3], [4, 2]];
        const rectanglePoints = boundaryPoints(points);

        expect(rectanglePoints).toHaveLength(4);
        expect(rectanglePoints[0][0]).toEqual(0);
        expect(rectanglePoints[0][1]).toEqual(2);
        expect(rectanglePoints[2][0]).toEqual(4);
        expect(rectanglePoints[2][1]).toEqual(3);
    });
});

describe("utils.pointInRectangle", () => {
    const rectangle = {x: 0, y: 0, width: 100, height: 100};

    it("should return 'true' if point is inside the rectangle", () => {
        expect(pointInRectangle([50, 50], rectangle)).toBeTruthy();
    });

    it("should return 'false' if point is outside the rectangle", () => {
        expect(pointInRectangle([50, 200], rectangle)).toBeFalsy();
    });
});
