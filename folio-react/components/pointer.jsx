import React from "react";
import {uid} from "uid/secure";
import {
    EVENTS,
    CURSORS,
    NONE,
    POINTER_COLOR,
    POINTER_DELAY,
    POINTER_INTERVAL_DELAY,
    TRANSPARENT,
    POINTER_TENSION,
    POINTER_SIZE,
} from "../constants.js";
import {hypotenuse} from "../utils/math.ts";
import {SvgContainer} from "./svg.jsx";

// alias for setInterval
const createInterval = (ms, listener) => setInterval(listener, ms);

// @private method to group points by id
const groupPoints = points => {
    return points.reduce((acc, point) => {
        if (acc.length === 0 || acc[acc.length - 1].id !== point.id) {
            acc.push({id: point.id, points: []});
        }
        acc[acc.length - 1].points.push(point);
        return acc;
    }, []);
};

// @private laser brush component
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
            strokeWidth={props.size * (0.5 + 0.5 * (step.length / lastLength))}
            strokeLinecap={"butt"}
            strokeLinejoin="round"
        />
    ))
};

// @private
const pointerStyle = {
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
};

// @public pointer component
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
                    const threshold = Date.now() - (props.delay ?? POINTER_DELAY);
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
        const id = uid(20); // generate a unique id for this points group
        const handlePointerMove = moveEvent => {
            return setPoints(prevPoints => {
                return [...prevPoints, {
                    x: moveEvent.clientX, // - left,
                    y: moveEvent.clientY, // - top,
                    id: id,
                    time: Date.now(),
                }];
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
        <div style={pointerStyle} onPointerDown={handlePointerDown}>
            {groupPoints(points).map(group => (
                <SvgContainer key={group.id}>
                    {group.points.length > 2 && (
                        <LaserBrush
                            points={group.points}
                            color={props.color ?? POINTER_COLOR}
                            size={props.size ?? POINTER_SIZE}
                        />
                    )}
                    {group.points.length > 0 && (
                        <ellipse
                            cx={group.points[group.points.length - 1].x}
                            cy={group.points[group.points.length - 1].y}
                            rx={(props.size ?? POINTER_SIZE) / 2}
                            ry={(props.size ?? POINTER_SIZE) / 2}
                            fill={props.color ?? POINTER_COLOR}
                            stroke={NONE}
                            opacity={0.8}
                        />
                    )}
                </SvgContainer>
            ))}
        </div>
    );
};
