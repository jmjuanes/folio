import React from "react";

import {DEFAULT_GRID_WIDTH} from "../constants.js";

export const Grid = props => {
    const ref = React.useRef(null);
    React.useEffect(() => {
        ref.current.setAttribute("width", props.width + "px");
        ref.current.setAttribute("height", props.height + "px");
    }, [props.width, props.height]);

    React.useEffect(() => {
        const canvas = ref.current.getContext("2d");
        canvas.clearRect(0, 0, props.width, props.height);
        canvas.globalAlpha = props.opacity;
        canvas.beginPath();
        canvas.setLineDash([]);
        canvas.strokeStyle = props.color;
        canvas.lineWidth = DEFAULT_GRID_WIDTH;
        // Horizontal rules
        for (let i = 0; i * props.size < props.height; i++) {
            canvas.moveTo(0, i * props.size);
            canvas.lineTo(props.width, i * props.size);
        }
        // Vertical rules
        for (let i = 0; i * props.size < props.width; i++) {
            canvas.moveTo(i * props.size, 0);
            canvas.lineTo(i * props.size, props.height);
        }
        canvas.stroke();
        canvas.globalAlpha = 1;
    }, [props.width, props.height, props.color, props.size, props.opacity]);

    return (
        <canvas
            ref={ref}
            style={{
                bottom: "0px",
                left: "0px",
                position: "absolute",
                top: "0px",
                touchAction: "none",
                userSelect: "none",
            }}
        />
    );
};

Grid.defaultProps = {
    width: 0,
    height: 0,
    color: null,
    size: 0,
    // style: null,
    opacity: 0,
};
