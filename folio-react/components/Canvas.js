import React from "react";

export const Canvas = React.forwardRef((props, ref) => {
    React.useEffect(() => {
        ref.current.setAttribute("width", props.width + "px");
        ref.current.setAttribute("height", props.height + "px");
    }, [props.width, props.height]);

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
                zIndex: props.zIndex || 0,
                ...props.style,
            }}
            onPointerDown={props.onPointerDown}
            onPointerMove={props.onPointerMove}
            onPointerUp={props.onPointerUp}
            onDoubleClick={props.onDoubleClick}
        />
    );
});

Canvas.defaultProps = {
    width: 0,
    height: 0,
    zIndex: 0,
    style: {},
};
