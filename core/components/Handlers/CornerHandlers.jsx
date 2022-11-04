import React from "react";

// const topLeftHandler = (el, dx, dy) => {
//     const newValues = {};
//     newValues.x = Math.min(el.x + dx, el.x + el.width - 1); // getPosition(snapshot.x + x);
//     newValues.width = el.width + (el.x - newValues.x);
//     newValues.y = Math.min(el.y + dy, el.y + el.height - 1); // getPosition(snapshot.y + y);
//     newValues.height = el.height + (el.y - newValues.y);
//     return newValues;
// };
// 
// const topRightHandler = (el, dx, dy) => {
//     const newValues = {};
//     newValues.width = Math.max(el.width + dx, 1) // getPosition(element.x + snapshot.width + x) - element.x;
//     newValues.y = Math.min(el.y + dy, el.y + el.height - 1); // getPosition(snapshot.y + y);
//     newValues.height = el.height + (el.y - newValues.y);
//     return newValues;
// };
// 
// const bottomLeftHandler = (el, dx, dy) => {
//     const newValues = {};
//     newValues.x = Math.min(el.x + dx, el.x + el.width - 1); // getPosition(snapshot.x + x);
//     newValues.width = el.width + (el.x - newValues.x);
//     newValues.height = Math.max(el.height + dy, 1);
//     return newValues;
// };
// 
// const bottomRightHandler = (el, dx, dy) => {
//     const newValues = {};
//     newValues.width = Math.max(el.width + dx, 1) // getPosition(element.x + snapshot.width + x) - element.x;
//     newValues.height = Math.max(el.height + dy, 1);
//     return newValues;
// };

export const CornerHandlers = props => (
    <g fill="#fff" stroke={props.color} strokeWidth="1">
        <rect
            data-type="handler"
            data-value="top-left"
            x={props.points[0][0] - props.size}
            y={props.points[0][1] - props.size}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nwse-resize",
            }}
        />
        <rect
            data-type="handler"
            data-value="top-right"
            x={props.points[1][0]}
            y={props.points[1][1] - props.size}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nesw-resize",
            }}
        />
        <rect
            data-type="handler"
            data-value="bottom-right"
            x={props.points[2][0]}
            y={props.points[2][1]}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nwse-resize",
            }}
        />
        <rect
            data-type="handler"
            data-value="bottom-left"
            x={props.points[3][0] - props.size}
            y={props.points[3][1]}
            width={props.size}
            height={props.size}
            style={{
                cursor: "nesw-resize",
            }}
        />
    </g>
);

CornerHandlers.defaultProps = {
    color: "",
    size: 10,
};
