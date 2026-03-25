import React from "react";
import { uid } from "uid/secure";
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
import { hypotenuse } from "../utils/math.ts";
import { SvgContainer } from "./svg.tsx";

const createInterval = (ms: number, listener: () => void) => setInterval(listener, ms);

const groupPoints = (points: any[]) => {
    return points.reduce((acc: any[], point: any) => {
        if (acc.length === 0 || acc[acc.length - 1].id !== point.id) {
            acc.push({ id: point.id, points: [] });
        }
        acc[acc.length - 1].points.push(point);
        return acc;
    }, []);
};

const LaserBrush = (props: any) => {
    const points = props.points;
    const steps: any[] = [];
    const tension = POINTER_TENSION;
    let x0: number | null = null, y0: number | null = null;
    let x1: number | null = null, y1: number | null = null;
    let x2: number | null = null, y2: number | null = null;
    let lastLength = 0;
    for (let i = 0; i <= points.length; i++) {
        const point = points[i] || points[i - 1];
        if (i === 0) {
            x2 = point.x;
            y2 = point.y;
        }
        else if (i > 1) {
            const length = hypotenuse(x2! - x1!, y2! - y1!);
            const c1x = (-x0! + tension * x1! + x2!) / tension;
            const c1y = (-y0! + tension * y1! + y2!) / tension;
            const c2x = (x1! + tension * x2! - point.x) / tension;
            const c2y = (y1! + tension * y2! - point.y) / tension;
            steps.push({
                length: lastLength + length,
                path: `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`,
            });
            lastLength = lastLength + length;
        }
        x0 = x1; y0 = y1;
        x1 = x2; y1 = y2;
        x2 = point.x; y2 = point.y;
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

const pointerStyle: React.CSSProperties = {
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

export const PointerCanvasOverlay = () => {
    const [points, setPoints] = React.useState<any[]>([]);
    const timer = React.useRef<any>(null);

    React.useEffect(() => {
        return () => clearInterval(timer.current);
    }, []);

    React.useEffect(() => {
        if (points.length > 0) {
            timer.current = createInterval(POINTER_INTERVAL_DELAY, () => {
                return setPoints(prevPoints => {
                    const threshold = Date.now() - POINTER_DELAY;
                    let sliceIndex = -1;
                    for (let index = 0; index < prevPoints.length; index++) {
                        if (prevPoints[index].time >= threshold) {
                            sliceIndex = index;
                            break;
                        }
                    }
                    return sliceIndex === -1 ? [] : prevPoints.slice(sliceIndex);
                });
            });
            return () => {
                return clearInterval(timer.current);
            };
        }
    }, [points.length > 0]);

    const handlePointerDown = (event: React.PointerEvent) => {
        const target = event.target as HTMLElement;
        const id = uid(20);
        const handlePointerMove = (moveEvent: Event) => {
            const pe = moveEvent as PointerEvent;
            return setPoints(prevPoints => {
                return [...prevPoints, {
                    x: pe.clientX,
                    y: pe.clientY,
                    id: id,
                    time: Date.now(),
                }];
            });
        };
        const handlePointerUp = () => {
            target.removeEventListener(EVENTS.POINTER_MOVE, handlePointerMove);
            target.removeEventListener(EVENTS.POINTER_UP, handlePointerUp);
        };
        target.addEventListener(EVENTS.POINTER_MOVE, handlePointerMove);
        target.addEventListener(EVENTS.POINTER_UP, handlePointerUp);
    };

    return (
        <div style={pointerStyle} onPointerDown={handlePointerDown}>
            {groupPoints(points).map((group: any) => (
                <SvgContainer key={group.id}>
                    {group.points.length > 2 && (
                        <LaserBrush
                            points={group.points}
                            color={POINTER_COLOR}
                            size={POINTER_SIZE}
                        />
                    )}
                    {group.points.length > 0 && (
                        <ellipse
                            cx={group.points[group.points.length - 1].x}
                            cy={group.points[group.points.length - 1].y}
                            rx={POINTER_SIZE / 2}
                            ry={POINTER_SIZE / 2}
                            fill={POINTER_COLOR}
                            stroke={NONE}
                            opacity={0.8}
                        />
                    )}
                </SvgContainer>
            ))}
        </div>
    );
};
