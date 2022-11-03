import React from "react";

const topHandler = (el, dx, dy, hasShiftKey) => {
    const newValues = {};
    newValues.y = Math.min(el.y + dy, el.y + el.height - 1);
    newValues.height = el.height + (el.y - newValues.y);
    // if (hasShiftKey) {
    //     const delta = el.width / Math.max(el.height, 1);
    //     newValues.width = newValues.height * delta;
    //     newValues.x = el.x - (newValues.width - el.width) / 2;
    // }
    return newValues; 
};

const bottomHandler = (el, dx, dy) => ({
    height: Math.max(el.height + dy, 1),
});

const leftHandler = (el, dx, dy) => {
    const x = Math.min(el.x + dx, el.x + el.width - 1);
    const width = el.width + (el.x - x);
    return {x, width};
};

const rightHandler = (el, dx, dy) => ({
    width: Math.max(el.width + dx, 1),
});

export const EdgeHandlers = props => {
    const width = props.points[1][0] - props.points[0][0];
    const height = props.points[2][1] - props.points[1][1];

    return (
        <g fill="transparent">
            <rect
                x={props.points[0][0]}
                y={props.points[0][1] - 2 * props.padding}
                width={width}
                height={2 * props.padding}
                style={{
                    cursor: "ns-resize",
                }}
                onPointerDown={e => props.onPointerDown(e, topHandler)}
            />
            <rect
                x={props.points[3][0]}
                y={props.points[3][1]}
                width={width}
                height={2 * props.padding}
                style={{
                    cursor: "ns-resize",
                }}
                onPointerDown={e => props.onPointerDown(e, bottomHandler)}
            />
            <rect
                x={props.points[0][0] - 2 * props.padding}
                y={props.points[0][1]}
                width={2 * props.padding}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
                onPointerDown={e => props.onPointerDown(e, leftHandler)}
            />
            <rect
                x={props.points[1][0]}
                y={props.points[1][1]}
                width={2 * props.padding}
                height={height}
                style={{
                    cursor: "ew-resize",
                }}
                onPointerDown={e => props.onPointerDown(e, rightHandler)}
            />
        </g>
    );
};

EdgeHandlers.defaultProps = {
    padding: 5,
    points: [],
    onPointerDown: null,
};
