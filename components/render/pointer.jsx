import React from "react";
import {
    EVENTS,
    CURSORS,
    NONE,
    POINTER_COLOR,
    POINTER_DELAY,
    POINTER_INTERVAL_DELAY,
    POINTER_WIDTH,
    TRANSPARENT,
    POINTER_TENSION,
} from "@lib/constants.js";
import {hypotenuse} from "@lib/utils/math.js";
import {SvgContainer} from "@components/commons/svg.jsx";

const createInterval = (ms, listener) => setInterval(listener, ms);

const LaserBrush = props => {
    const points = props.points;
    const steps = [];
    const tension = POINTER_TENSION;
    let x0 = null, y0 = null;
    let x1 = null, y1 = null;
    let x2 = null, y2 = null;
    let lastLength = 0;
    for (let i = 0; i <= points.length; i++) {
        const point = points[i] || points[i - 1];
        if (i === 0) {
            x2 = point.x;
            y2 = point.y;
        }
        else if (i > 1) {
            // Calculate the length between these points
            const length = hypotenuse(x2 - x1, y2 - y1);
            // First control point
            const c1x = (-x0 + tension * x1 + x2) / tension;
            const c1y = (-y0 + tension * y1 + y2) / tension;
            // Second control point
            const c2x = (x1 + tension * x2 - point.x) / tension;
            const c2y = (y1 + tension * y2 - point.y) / tension;
            // Build the bezier curve
            steps.push({
                length: lastLength + length,
                path: `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`,
            });
            lastLength = lastLength + length;
        }
        // Update points
        x0 = x1, y0 = y1;
        x1 = x2, y1 = y2;
        x2 = point.x, y2 = point.y;
    }
    return steps.map((step, index) => (
        <path
            key={index}
            d={step.path}
            fill={NONE}
            stroke={props.color}
            strokeWidth={props.width * (0.3 + 0.7 * (step.length / lastLength))}
            strokeLinecap={"butt"}
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
    // Handle pointer down
    const handlePointerDown = event => {
        const target = event.target;
        const handlePointerMove = e => {
            return setPoints(prevPoints => {
                lastPoint.current = {
                    x: e.clientX, // - left,
                    y: e.clientY, // - top,
                    time: Date.now(),
                };
                return [...prevPoints, lastPoint.current];
            });
        };
        const handlePointerUp = () => {
            target.removeEventListener(EVENTS.POINTER_MOVE, handlePointerMove);
            target.removeEventListener(EVENTS.POINTER_UP, handlePointerUp);
        };
        // Register events listeners
        target.addEventListener(EVENTS.POINTER_MOVE, handlePointerMove);
        target.addEventListener(EVENTS.POINTER_UP, handlePointerUp);
    };
    return (
        <div style={props.style} onPointerDown={handlePointerDown}>
            <SvgContainer>
                {points.length > 2 && (
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
