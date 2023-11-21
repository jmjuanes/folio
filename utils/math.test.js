import {
    normalizeBounds,
    getPointsDistance,
    getRectangleBounds,
    simplifyPath,
    getPointDistanceToLine,
} from "./math.js";

describe("getPointsDistance", () => {
    it("should calculate the distance between two points", () => {
        expect(getPointsDistance([0,0], [10,0])).toEqual(10);
    });

    it("should calculate the distance between the given points", () => {
        expect(getPointsDistance([0,0], [10,0], [10,5])).toEqual(15);
    });
});

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

describe("simplifyPath", () => {
    const points = [
        [0,0],[1,0.1],[2,-0.1],[3,5],[4,6],[5,7],[6,8.1],[7,9],[8,9],[9,9],
    ];

    it("should return the same start and end", () => {
        const newPoints = simplifyPath(points, 1);

        expect(newPoints[0][0]).toBe(points[0][0]);
        expect(newPoints[0][1]).toBe(points[0][1]);
        expect(newPoints[newPoints.length - 1][0]).toBe(points[points.length - 1][0]);
        expect(newPoints[newPoints.length - 1][1]).toBe(points[points.length - 1][1]);
    });

    it("should return less points", () => {
        const newPoints = simplifyPath(points, 1);

        expect(newPoints.length).toBeLessThan(points.length);
    });

    it("should return points in the original points list", () => {
        const newPoints = simplifyPath(points, 1);

        expect(newPoints[1][0]).toBe(points[2][0]);
        expect(newPoints[1][1]).toBe(points[2][1]);
        expect(newPoints[2][0]).toBe(points[3][0]);
        expect(newPoints[2][1]).toBe(points[3][1]);
        expect(newPoints[3][0]).toBe(points[7][0]);
        expect(newPoints[3][1]).toBe(points[7][1]);
    });
});

describe("getPointDistanceToLine", () => {
    it("should return the distance of a point to the given line", () => {
        const distance = getPointDistanceToLine([1, 4], [[2, 3], [5, 6]]);

        expect(distance).toEqual(expect.closeTo(1.41421, 5));
    });
});
