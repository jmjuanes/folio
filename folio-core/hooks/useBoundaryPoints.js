export const useBoundaryPoints = element => {
    if (typeof element.width === "number" && typeof element.height === "number") {
        return [
            [element.x, element.y],
            [element.x + element.width, element.y],
            [element.x + element.width, element.y + element.height],
            [element.x, element.y + element.height],
        ];
    }
    else if (typeof element.x2 === "number" && typeof element.y2 === "number") {
        return [
            [element.x, element.y],
            [element.x2, element.y2],
        ];
    }
    // Other case --> not valid boundary points
    return [];
};
