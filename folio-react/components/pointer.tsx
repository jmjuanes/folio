import React from "react";
import { NONE } from "../constants.js";
import { SvgContainer } from "./svg.tsx";
import { hypotenuse } from "../utils/math.ts";

export type PointerPoint = {
    x: number;
    y: number;
    time: number;
};

export type PointerProps = {
    points: PointerPoint[];
    color: string;
    size: number;
    opacity?: number;
};

export const Pointer = (props: PointerProps) => {
    const { points, color, size, opacity = 1 } = props;
    if (points.length === 0) {
        return null;
    }

    const steps: any[] = [];
    const tension = 0.5 * 12; // tension
    let x0: number | null = null, y0: number | null = null;
    let x1: number | null = null, y1: number | null = null;
    let x2: number | null = null, y2: number | null = null;
    let lastLength = 0;

    for (let i = 0; i <= points.length; i++) {
        const point = points[i] || points[i - 1];
        if (i === 0) {
            x2 = point.x;
            y2 = point.y;
        } else if (i > 1) {
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

    return (
        <SvgContainer>
            <g opacity={opacity}>
                {points.length > 2 && (
                    <React.Fragment>
                        {steps.map((step, index) => (
                            <path
                                key={index}
                                d={step.path}
                                fill={NONE}
                                stroke={color}
                                strokeWidth={size * (0.5 + 0.5 * (step.length / lastLength))}
                                strokeLinecap="butt"
                                strokeLinejoin="round"
                            />
                        ))}
                    </React.Fragment>
                )}
                <ellipse
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    rx={size / 2}
                    ry={size / 2}
                    fill={color}
                    stroke={NONE}
                />
            </g>
        </SvgContainer>
    );
};
