import * as math from "./math.js";

const points = [[0,0],[1,0.1],[2,-0.1],[3,5],[4,6],[5,7],[6,8.1],[7,9],[8,9],[9,9]];

it("simplifyPath: should return the same start and end", () => {
    const newPoints = math.simplifyPath(points, 1);

    expect(newPoints[0][0]).toBe(points[0][0]);
    expect(newPoints[0][1]).toBe(points[0][1]);
    expect(newPoints[newPoints.length - 1][0]).toBe(points[points.length - 1][0]);
    expect(newPoints[newPoints.length - 1][1]).toBe(points[points.length - 1][1]);
});

it("simplifyPath: should return less points", () => {
    const newPoints = math.simplifyPath(points, 1);

    expect(newPoints.length).toBeLessThan(points.length);
});

it("simplifyPath: should return points in the original points list", () => {
    const newPoints = math.simplifyPath(points, 1);

    expect(newPoints[1][0]).toBe(points[2][0]);
    expect(newPoints[1][1]).toBe(points[2][1]);
    expect(newPoints[2][0]).toBe(points[3][0]);
    expect(newPoints[2][1]).toBe(points[3][1]);
    expect(newPoints[3][0]).toBe(points[7][0]);
    expect(newPoints[3][1]).toBe(points[7][1]);
});
