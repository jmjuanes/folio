import React from "react";
import {CURSORS, NONE, POINTER_COLOR, POINTER_DELAY, POINTER_INTERVAL_DELAY, POINTER_WIDTH, TRANSPARENT} from "../constants";
import {SvgContainer} from "./SvgContainer.jsx";
import {stopEventPropagation} from "../utils/events.js";
import {getPointsCenter, hypotenuse} from "../utils/math.js";

const createInterval = (ms, listener) => setInterval(listener, ms);

const LaserBrush = props => {
    const steps = [];
    let lastPoint = props.points[0];
    let lastLength = 0;
    for (let i = 1; i < props.points.length; i++) {
        const point = props.points[i];
        const center = getPointsCenter([lastPoint.x, lastPoint.y], [point.x, point.y]);
        const length = hypotenuse(lastPoint.x - point.x, lastPoint.y - point.y);
        steps.push({
            length: lastLength + length,
            path: `M${lastPoint.x},${lastPoint.y}Q${lastPoint.x},${lastPoint.y} ${center[0]},${center[1]}L${point.x},${point.y}`,
        });
        lastPoint = point;
        lastLength = lastLength + length;
    }
    // Calculate the total length of the path
    return steps.map((step, index) => (
        <path
            key={index}
            d={step.path}
            fill={NONE}
            stroke={props.color}
            strokeWidth={props.width * (0.5 + 0.5 * (step.length / lastLength))}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    ))
};

export const Pointer = props => {
    const [points, setPoints] = React.useState([]);
    const lastPoint = React.useRef(null);
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
            lastPoint.current = {
                x: event.nativeEvent.clientX, // - left,
                y: event.nativeEvent.clientY, // - top,
                time: Date.now(),
            };
            return [...prevPoints, lastPoint.current];
        });
    };
    return (
        <div style={props.style} onPointerDown={stopEventPropagation} onPointerMove={handlePointerMove}>
            <SvgContainer>
                {points.length > 0 && (
                    <LaserBrush
                        points={points}
                        color={props.color}
                        width={props.width}
                    />
                )}
                {lastPoint.current && (
                    <ellipse
                        cx={lastPoint.current.x}
                        cy={lastPoint.current.y}
                        rx={props.width / 2}
                        ry={props.width / 2}
                        fill={props.color}
                        stroke={NONE}
                        opacity={0.8}
                    />
                )}
            </SvgContainer>
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
