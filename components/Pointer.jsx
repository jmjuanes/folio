import React from "react";
import {CURSORS, NONE, POINTER_COLOR, POINTER_DELAY, POINTER_INTERVAL_DELAY, POINTER_WIDTH, TRANSPARENT} from "../constants";
import {SvgContainer} from "./SvgContainer.jsx";
import {stopEventPropagation} from "../utils/events.js";
import {getPointsCenter} from "../utils/math.js";

const createInterval = (ms, listener) => setInterval(listener, ms);

const getPath = points => {
    let lastPoint = points[0];
    const commands = [
        `M${lastPoint.x},${lastPoint.y}`,
    ];
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const center = getPointsCenter([lastPoint.x, lastPoint.y], [point.x, point.y]);
        commands.push(`Q${lastPoint.x},${lastPoint.y} ${center[0]},${center[1]}`);
        lastPoint = point;
    }
    commands.push(`L${lastPoint.x},${lastPoint.y}`);
    return commands.join(" ");
};

export const Pointer = props => {
    const [points, setPoints] = React.useState([]);
    const timer = React.useRef(null);
    // When component is unmounted, clear current interval
    React.useEffect(() => {
        return () => clearInterval(timer.current);
    }, []);
    // Initialize timer to remove points after the specified time
    React.useEffect(() => {
        if (points.length > 0) {
            timer.current = createInterval(POINTER_INTERVAL_DELAY, () => {
                return setPoints(prevPoints => {
                    const threshold = Date.now() - props.delay;
                    let sliceIndex = -1;
                    // remove timeout points
                    for (let index = 0; index < prevPoints.length; index++) {
                        if (prevPoints[index].time >= threshold) {
                            sliceIndex = index;
                            break;
                        }
                    }
                    // Return new points
                    return sliceIndex === -1 ? [] : prevPoints.slice(sliceIndex);
                });
            });
            return () => {
                return clearInterval(timer.current);
            };
        }
    }, [points.length > 0]);
    // Handle pointer move
    const handlePointerMove = event => {
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
                        stroke={props.color}
                        strokeWidth={props.width}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </SvgContainer>
            )}
        </div>
    );
};

Pointer.defaultProps = {
    color: POINTER_COLOR,
    width: POINTER_WIDTH,
    delay: POINTER_DELAY,
    style: {
        backgroundColor: TRANSPARENT,
        cursor: CURSORS.CROSS,
        display: "block",
        left: "0px",
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        top: "0px",
        touchAction: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
    },
};
