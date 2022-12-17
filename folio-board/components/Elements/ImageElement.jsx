import React from "react";

export const ImageElement = props => {
    // const x = Math.min(props.x1, props.x2);
    // const y = Math.min(props.y1, props.y2);
    // const width = Math.abs(props.x2 - props.x1);
    // const height = Math.abs(props.y2 - props.y1);
    return (
        <g transform="">
            <image
                data-element={props.id}
                x={Math.min(props.x1, props.x2)}
                y={Math.min(props.y1, props.y2)}
                width={Math.abs(props.x2 - props.x1)}
                height={Math.abs(props.y2 - props.y1)}
                href={props.image}
                onPointerDown={props.onPointerDown}
                onDoubleClick={props.onDoubleClick}
            />
        </g>
    );
};