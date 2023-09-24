import React from "react";
import {CURSORS, NONE, TRANSPARENT} from "../constants";
import {SvgContainer} from "./SvgContainer.jsx";
import {stopEventPropagation} from "../utils/events.js";

const getPath = points => {
    let lastPoint = points[0];
    const commands = [
        `M${lastPoint[0]},${lastPoint[1]}`,
    ];
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const center = getPointsCenter(lastPoint, point);
        commands.push(`Q${lastPoint[0]},${lastPoint[1]} ${center[0]},${center[1]}`);
        lastPoint = point;
    }
    commands.push(`L${lastPoint[0]},${lastPoint[1]}`);
    return commands.join(" ");
};

export const Pointer = props => {
    const [points, setPoints] = React.useState([]);
    const timer = React.useRef(null);
    // When component is unmounted, clear current interval
    React.useEffect(() => {
        return () => clearInterval(timer.current);
    }, []);
    // Check to remove the next point
    // if (points.length > 0 && timer.current === null) {
    //     
    // }
    // Handle pointer move
    const handlePointerMove = event => {
        console.log("MOVE");
        return setPoints(prevPoints => {
            const point = {
                x: event.nativeEvent.clientX, // - left,
                y: event.nativeEvent.clientY, // - top,
                time: Date.now(),
            };
            return [...prevPoints, point];
        });
    };
    return (
        <div style={props.style} onPointerDown={stopEventPropagation} onPointerMove={handlePointerMove}>
            {points.length > 0 && (
                <SvgContainer>
                    <path
                        d={getPath(points)}
                        fill={NONE}
                        stroke="#000"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </SvgContainer>
            )}
        </div>
    );
};

Pointer.defaultProps = {
    delay: 300,
    style: {
        backgroundColor: TRANSPARENT,
        cursor: CURSORS.CROSS,
        display: "block",
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
    },
};
