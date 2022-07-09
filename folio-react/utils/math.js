// Get absolute positions
export const getAbsolutePositions = (position, size) => {
    return [
        Math.min(position, position + size),
        Math.max(position, position + size)
    ];
};

// Generate the outer rectangle that includes all items in the list
export const getOuterRectangle = items => {
    let xStart = Infinity, yStart = Infinity, xEnd = 0, yEnd = 0;
    items.forEach(item => {
        const [x0, x1] = getAbsolutePositions(item.x, item.width);
        const [y0, y1] = getAbsolutePositions(item.y, item.height);
        xStart = Math.min(x0, xStart);
        xEnd = Math.max(x1, xEnd);
        yStart = Math.min(y0, yStart);
        yEnd = Math.max(y1, yEnd);
    });
    return {
        x: xStart,
        y: yStart,
        width: Math.abs(xEnd - xStart),
        height: Math.abs(yEnd - yStart),
    };
};

